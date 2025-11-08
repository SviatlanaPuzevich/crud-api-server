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

export interface User {
  id: string;
  name: string;
  age: number;
  hobbies: string[];
}

export interface NewUser {
  name: string;
  age: number;
  hobbies: string[];
}

export const isNewUser = (obj: unknown): obj is NewUser => {
  return !(
    typeof obj !== "object" ||
    obj === null ||
    !("name" in obj) ||
    typeof (obj as { name?: unknown }).name !== "string" ||
    (obj as { name: string }).name.trim() === "" ||
    !("age" in obj) ||
    typeof obj["age"] !== "number" ||
    obj["age"] < 0 ||
    !Number.isInteger(obj["age"]) ||
    !("hobbies" in obj) ||
    !Array.isArray((obj as { hobbies?: unknown }).hobbies)
  );
};

export const isUser = (obj: unknown): obj is User => {
  return !(
    typeof obj !== "object" ||
    obj === null ||
    !("id" in obj) ||
    typeof (obj as { id?: unknown }).id !== "string" ||
    !("name" in obj) ||
    typeof (obj as { name?: unknown }).name !== "string" ||
    (obj as { name: string }).name.trim() === "" ||
    !("age" in obj) ||
    typeof obj["age"] !== "number" ||
    obj["age"] < 0 ||
    !Number.isInteger(obj["age"]) ||
    !("hobbies" in obj) ||
    !Array.isArray((obj as { hobbies?: unknown }).hobbies)
  );
};
