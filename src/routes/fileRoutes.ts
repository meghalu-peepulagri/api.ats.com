import { Hono } from "hono";

import FileController from "../controllers/fileController.js";

const fileRoute = new Hono();
const fileController = new FileController();

fileRoute.post("/upload", fileController.getUploadURL);
fileRoute.post("/download", fileController.getDownloadURL);

export default fileRoute;
