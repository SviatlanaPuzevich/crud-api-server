import { Action } from "../types";
import Router from "./router";
import { IncomingMessage, ServerResponse } from "http";
import { matchPath, normalizePath } from "../helpers/pathHelper";

export class RouteDispatcher {
  private routes: Action[] = [];

  constructor() {}

  registerRouter(router: Router) {
    this.routes = this.routes.concat(router.getActions());
  }

  async dispatch(
    path: string,
    method: string,
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    const pathName = normalizePath(path);
    let routeFound: boolean = false;

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }
      const match = matchPath(route.path, pathName);
      if (match.matched) {
        routeFound = true;
        try {
          await route.handler(request, response, match.params);
        } catch (error) {
          console.error("Error in handler:", error);
          if (!response.headersSent) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Internal Server Error" }));
          }
        }
        break;
      }
    }

    if (!routeFound) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "unknown endpoint" }));
    }
  }
}
