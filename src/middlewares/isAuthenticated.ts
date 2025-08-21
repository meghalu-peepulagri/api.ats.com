import type { Context } from "hono";

import { createMiddleware } from "hono/factory";

import { getUserDetailsFromToken } from "../utils/jwtUtils.js";

export const isAuthenticated = createMiddleware(async (c: Context, next) => {
  const user = await getUserDetailsFromToken(c);
  c.set("user_payload", user);
  await next();
});
