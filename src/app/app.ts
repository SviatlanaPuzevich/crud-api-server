import http from "node:http";
import { URL } from "node:url";
import { RouteDispatcher } from "../router/routeDispatcher";
import { userRouter } from "../controllers/userController";

const routeDispatcher = new RouteDispatcher();
routeDispatcher.registerRouter(userRouter);

export const app = http.createServer((request, response) => {
  if (!request.url || !request.method) {
    response.statusCode = 400;
    return response.end("Bad Request");
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  routeDispatcher
    .dispatch(url.pathname, request.method, request, response)
    .catch((err) => {
      console.error("Error in route:", err);
      response.statusCode = 500;
      response.end("Internal Server Error");
    });
});
