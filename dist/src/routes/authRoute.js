import { Hono } from "hono";
import UsersController from "../controllers/usersController.js";
const authRoute = new Hono();
const usersController = new UsersController();
authRoute.post("/signup", usersController.addUser.bind(usersController));
authRoute.post("/login", usersController.loginUserByEmail.bind(usersController));
export default authRoute;
