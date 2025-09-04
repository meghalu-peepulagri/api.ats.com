import { Hono } from "hono";

import ApplicantsController from "../controllers/applicantsController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const applicantsRoute = new Hono();
const applicantsController = new ApplicantsController();

applicantsRoute.post("/", isAuthenticated, applicantsController.addApplicant.bind(applicantsController));
applicantsRoute.get("/:id", applicantsController.getApplicantById.bind(applicantsController));
applicantsRoute.get("/", isAuthenticated, applicantsController.listApplicants.bind(applicantsController));
applicantsRoute.patch("/:id", isAuthenticated, applicantsController.editApplicant.bind(applicantsController));
applicantsRoute.patch(":id/role", isAuthenticated, applicantsController.editApplicantRoleById.bind(applicantsController));
applicantsRoute.patch("/:id/status", isAuthenticated, applicantsController.updateStatusApplicant.bind(applicantsController));
applicantsRoute.delete("/:id", isAuthenticated, applicantsController.deleteApplicantById.bind(applicantsController));
applicantsRoute.get("/dashboard/stats", applicantsController.applicantStats.bind(applicantsController));

export default applicantsRoute;
