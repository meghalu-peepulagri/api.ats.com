// index.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import applicantsRoute from "./routes/applicantsRoute.js";
import fileRoute from "./routes/fileRoutes.js";
import { cors } from "hono/cors";
import onError from './utils/onError.js';
import notFound from './utils/notFound.js';
const app = new Hono();
app.use('*', logger());
// Start the server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
app.use("*", cors());
app.route("/applicants", applicantsRoute);
app.route("/files", fileRoute);
app.notFound(notFound);
app.onError(onError);
