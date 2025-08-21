import { serve } from "@hono/node-server";
import app from "./app.js";
import envData from "./env.js";
// Start the server
const port = envData.PORT;
serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);
