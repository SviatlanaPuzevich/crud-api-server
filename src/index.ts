import config from "./config/config";
import { app } from "./app/app";

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}/`);
});
