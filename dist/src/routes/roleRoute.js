import { Hono } from "hono";
import RolesController from "../controllers/rolesController.js";
const roleRoute = new Hono();
const rolesController = new RolesController();
roleRoute.post("/", rolesController.addRole.bind(rolesController));
roleRoute.get("/", rolesController.listRoles.bind(rolesController));
export default roleRoute;
