import cluster, {Worker} from 'node:cluster';
import os from 'node:os';
import config from "../config/config";
import {createApp} from "../app/app";
import * as process from "node:process";
import {isUsersChangedMessage, store} from "../store/store";
import * as console from "node:console";
import http from "node:http";

interface WorkerInfo {
    worker: Worker;
    port: number;
}

const scaleHorizontal = () => {
    const numberOfWorkers = os.cpus().length - 1;
    if (cluster.isPrimary) {
        console.log(`Master ${process.pid} starting ${numberOfWorkers} workers`);
        const basePort = config.port;
        const workersInfo: WorkerInfo[] = [];

        for (let i = 0; i < numberOfWorkers; i++) {
            const workerPort = basePort + i + 1;
            createWorker(workerPort, workersInfo);
        }

        let current = 0;
        const balancer = http.createServer((req, res) => {
            if (workersInfo.length === 0) {
                return;
            }

            // @ts-ignore
            const workerInfo: WorkerInfo = workersInfo[current];
            current = (current + 1) % workersInfo.length;

            const balancerReq = http.request(
                {
                    hostname: 'localhost',
                    port: workerInfo.port,
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                },
                (balancerRes) => {
                    res.writeHead(balancerRes.statusCode!, balancerRes.headers);
                    balancerRes.pipe(res, {end: true});
                }
            );

            req.pipe(balancerReq, {end: true});

        });

        balancer.listen(basePort, () => {
            console.log(`Load balancer running at http://localhost:${basePort}`);
            console.log(`Workers running on ports: ${workersInfo.map(w => w.port).join(', ')}`);
        });
    }

    if (cluster.isWorker) {
        const port = Number(process.env.WORKER_PORT);

        global.process.on('message', (msg: unknown) => {
            if (isUsersChangedMessage(msg)) {
                store.users = msg.users;
                console.log(`[Worker ${global.process.pid} on port ${port}]: Users changed`)
            }
        })

        const app = createApp();
        app.listen(port, () => {
            console.log(`[Worker ${global.process.pid}]: running on port ${port}`);
        });
    }
}

function createWorker(port: number, workersInfo: WorkerInfo[]) {
    const workerEnv = {WORKER_PORT: String(port)};
    const worker = cluster.fork(workerEnv);
    const workerInfo: WorkerInfo = {worker, port};
    workersInfo.push(workerInfo);

    console.log(`Worker ${worker.process.pid} forked for port ${port}`);

    worker.on('message', (msg) => {
        for (const info of workersInfo) {
            if (info.worker !== worker && info.worker.isConnected()) {
                info.worker.send(msg);
            }
        }
    })

    worker.on('exit', (code, signal) => {
        console.log(`Worker ${worker.process.pid} on port ${port} died (code: ${code}, signal: ${signal})`);

        const idx = workersInfo.findIndex(it => it.worker === worker);
        if (idx !== -1) {
            workersInfo.splice(idx, 1);
        }

        console.log(`Restarting worker on port ${port}...`);
        createWorker(port, workersInfo);
    });
}

scaleHorizontal();