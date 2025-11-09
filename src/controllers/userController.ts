import { isNewUser, isUser, NewUser, User } from "../types";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { getBody } from "../helpers/requestHelper";
import Router from "../router/router";
import { ServerResponse } from "http";
import {store} from "../store/store";

export const userRouter = new Router("/api/users");

userRouter.get("/", async (_request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(store.users));
});

userRouter.get("/{userId}", async (_request, response, params) => {
  const user = extractUser(response, params);
  if (!user) return;
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(user));
});

userRouter.post("/", async (request, response) => {
  try {
    const uuid = uuidv4();
    const user: NewUser = await getBody<NewUser>(request, isNewUser);
    const newUserObj = { id: uuid, ...user };
    store.users.push(newUserObj);
    store.publish();
    response.writeHead(201, { "Content-Type": "application/json" });
    response.end(JSON.stringify(newUserObj));
  } catch (error) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid request body" }));
  }
});

userRouter.put("/{userId}", async (request, response, params) => {
  const existingUser = extractUser(response, params);
  if (!existingUser) return;

  try {
    const updatedData: User = await getBody<User>(request, isUser);
    const updatedUser: User = { ...updatedData, id: existingUser.id };
    store.users = store.users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    store.publish();
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(updatedUser));
  } catch (error) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid request body" }));
  }
});

userRouter.delete("/{userId}", async (_request, response, params) => {
  const user = extractUser(response, params);
  if (!user) return;
  store.users = store.users.filter((u) => u.id !== user.id);
  store.publish();
  response.writeHead(204, { "Content-Type": "application/json" });
  response.end();
});

function extractUser(
  response: ServerResponse,
  params: Record<string, string> | undefined,
): User | null {
  const userId = params?.userId;
  if (!userId || !uuidValidate(userId)) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "malformatted id" }));
    return null;
  }
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "user not found" }));
    return null;
  }
  return user;
}
