import { Hono } from "hono";
import CommentsController from "../controllers/commentsController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
const commentsRoute = new Hono();
const commentsController = new CommentsController();
// applicantId
commentsRoute.post("/:id", isAuthenticated, commentsController.addCommentToApplicant.bind(commentsController));
commentsRoute.get("/:applicant_id", isAuthenticated, commentsController.listCommentsByApplicantId.bind(commentsController));
commentsRoute.patch("/:id", isAuthenticated, commentsController.updateCommentByApplicantById.bind(commentsController));
commentsRoute.delete("/:applicant_id/comment/:id", isAuthenticated, commentsController.deleteCommentById.bind(commentsController));
export default commentsRoute;
