import { Hono } from "hono";
import ApplicantsController from "../controllers/applicantsController.js";

const applicantsRoute = new Hono();
const applicantsController = new ApplicantsController();

applicantsRoute.post("/", applicantsController.addApplicant);
applicantsRoute.get("/:id", applicantsController.getApplicantById);
applicantsRoute.get("/", applicantsController.listApplicants);
applicantsRoute.patch("/:id", applicantsController.updateStatusApplicant);


export default applicantsRoute;



