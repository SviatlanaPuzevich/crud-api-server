import cluster, {Worker} from 'node:cluster';
import os from 'node:os';
import config from "../config/config";
import {createApp} from "../app/app";
import * as process from "node:process";
import {isUsersChangedMessage, store} from "../store/store";
import * as console from "node:console";
import http from "node:http";

const scaleHorizontal = () => {
    const numberOfWorkers = os.cpus().length - 1;
    if (cluster.isPrimary) {
        console.log(`Master ${process.pid} starting ${numberOfWorkers} workers`);
        let basePort = config.port;
        const workerPorts: number[] = [];
        const workers: Worker[] = [];
        for (let i = 0; i < numberOfWorkers; i++) {
            const workerPort = basePort + i + 1;
            workerPorts.push(workerPort);
            const workerEnv = {WORKER_PORT: workerPort};
            createWorker(workerEnv, workers);
        }
        let current = 0;
        const balancer = http.createServer((req, res) => {
            const currentPort = workerPorts[current];
            const worker = workers[current];
            current = (current + 1) % workerPorts.length;
            if (!worker) {
                throw new Error(`Cannot find worker`);
            }
            const balancerReq = http.request(
                {
                    hostname: 'localhost',
                    port: currentPort,
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

            balancerReq.on('error', (err) => {
                console.error(`Load balancer error: ${err.message}`);
                res.writeHead(502);
                res.end('Bad Gateway');
            });
        });
        balancer.listen(basePort, () => {
            console.log(`Load balancer running at http://localhost:${basePort}`);
        });
    }

    if (cluster.isWorker) {
        const port = process.env.WORKER_PORT;
        global.process.on('message', (msg: unknown) => {
            if (isUsersChangedMessage(msg)) {
                store.users = msg.users;
                console.log(`[${global.process.pid}]: Users changed`)
            }
        })
        const app = createApp();
        app.listen(port);
        console.log(`[${global.process.pid}]: worker is running at ${port}`);
    }
}

function createWorker(workerEnv: Record<string, string | number>, workers: Worker[]) {
    const worker = cluster.fork(workerEnv);
    workers.push(worker);
    // Broadcast
    worker.on('message', (msg) => {
        for (const w of workers) {
            if (w !== worker) {
                w.send(msg);
            }
        }
    })
    worker.on('exit', () => {
        // remove broken worker from the list
        const idx = workers.findIndex(it => it === worker);
        workers.splice(idx, 1);
        createWorker(workerEnv, workers);
    });
}

scaleHorizontal();