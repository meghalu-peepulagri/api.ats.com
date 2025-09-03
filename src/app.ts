import { Hono } from "hono";
import { cors } from "hono/cors";

import { SERVICE_UP } from "./constants/appMessages.js";
import { OK } from "./constants/httpStatusCodes.js";
import envData from "./env.js";
import applicantsRoute from "./routes/applicantsRoute.js";
import authRoute from "./routes/authRoute.js";
import commentsRoute from "./routes/commentsRoute.js";
import fileRoute from "./routes/fileRoutes.js";
import roleRoute from "./routes/roleRoute.js";
import notFound from "./utils/notFound.js";
import onError from "./utils/onError.js";
import { sendResponse } from "./utils/sendResponse.js";

const appVersion = envData.API_VERSION;
const app = new Hono().basePath(`v${appVersion}`);
app.use("*", cors());

app.get("/", (c) => {
  return sendResponse(c, OK, SERVICE_UP);
});

app.route("/auth", authRoute);
app.route("/applicants", applicantsRoute);
app.route("/files", fileRoute);
app.route("/comments", commentsRoute);
app.route("/roles", roleRoute);

app.notFound(notFound);
app.onError(onError);

export default app;
