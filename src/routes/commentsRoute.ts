import { Hono } from "hono";

import CommentsController from "../controllers/commentsController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const commentsRoute = new Hono();
const commentsController = new CommentsController();

commentsRoute.post("/:id", isAuthenticated, commentsController.addCommentToApplicant.bind(commentsController));
commentsRoute.get("/:id", isAuthenticated, commentsController.listComments.bind(commentsController));
export default commentsRoute;
