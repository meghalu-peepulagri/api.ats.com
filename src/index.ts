import { serve } from "@hono/node-server";
// index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import applicantsRoute from "./routes/applicantsRoute.js";
import fileRoute from "./routes/fileRoutes.js";
import notFound from "./utils/notFound.js";
import onError from "./utils/onError.js";

const app = new Hono();

app.use("*", logger());

// Start the server
const port = 3000;
// eslint-disable-next-line no-console
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

app.use("*", cors());

app.route("/applicants", applicantsRoute);
app.route("/files", fileRoute);

app.notFound(notFound);
app.onError(onError);
