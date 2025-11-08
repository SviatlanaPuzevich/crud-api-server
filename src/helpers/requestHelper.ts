import { IncomingMessage } from "http";

type Validator<T> = (obj: unknown) => obj is T;

export const getBody = async <T>(
  request: IncomingMessage,
  validator: Validator<T>,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        const parsed = JSON.parse(body);

        if (validator(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error("Body does not match expected type"));
        }
      } catch (err) {
        reject(err);
      }
    });

    request.on("error", (err) => reject(err));
  });
};
