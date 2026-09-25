import { loadConfig } from "./config.js";
import { createApp } from "./app.js";

// Process entrypoint: load+validate env config, build the app via the
// composition root, then start listening. Kept minimal on purpose — all
// real wiring lives in app.js so it can be constructed/tested without
// actually binding a port.
const config = loadConfig();
const { app } = createApp(config);

app.listen(config.API_PORT, () => {
  console.log(`HomeTutoring API listening on :${config.API_PORT}`);
});
