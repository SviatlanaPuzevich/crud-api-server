import { IncomingMessage, ServerResponse } from "http";

export enum Method {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type RouteHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  params?: Record<string, string>,
) => Promise<void>;

export interface Action {
  path: string;
  method: Method;
  handler: RouteHandler;
}
