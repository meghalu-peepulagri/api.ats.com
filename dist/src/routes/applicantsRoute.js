import { Hono } from "hono";
import ApplicantsController from "../controllers/applicantsController.js";
const applicantsRoute = new Hono();
const applicantsController = new ApplicantsController();
applicantsRoute.post("/", applicantsController.addApplicant.bind(applicantsController));
applicantsRoute.get("/:id", applicantsController.getApplicantById.bind(applicantsController));
applicantsRoute.get("/", applicantsController.listApplicants.bind(applicantsController));
applicantsRoute.patch("/:id", applicantsController.updateStatusApplicant.bind(applicantsController));
export default applicantsRoute;
