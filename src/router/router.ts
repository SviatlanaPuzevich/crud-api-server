import { Action, Method, RouteHandler } from "../types";
import { normalizePath } from "../helpers/pathHelper";

class Router {
  private readonly baseURL: string;
  private availableRoutes: Action[] = [];

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  get(route: string, handler: RouteHandler): void {
    this.#registerAction({
      path: normalizePath(this.baseURL + route),
      method: Method.GET,
      handler,
    });
  }

  post(route: string, handler: RouteHandler): void {
    this.#registerAction({
      path: normalizePath(this.baseURL + route),
      method: Method.POST,
      handler,
    });
  }

  put(route: string, handler: RouteHandler): void {
    this.#registerAction({
      path: normalizePath(this.baseURL + route),
      method: Method.PUT,
      handler,
    });
  }

  delete(route: string, handler: RouteHandler): void {
    this.#registerAction({
      path: normalizePath(this.baseURL + route),
      method: Method.DELETE,
      handler,
    });
  }

  #registerAction(action: Action): void {
    this.availableRoutes.push(action);
  }

  getActions(): Action[] {
    return this.availableRoutes;
  }
}

export default Router;
