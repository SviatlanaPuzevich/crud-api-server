import config from "./config/config";
import { createApp } from "./app/app";

const app = createApp();
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}/`);
});
