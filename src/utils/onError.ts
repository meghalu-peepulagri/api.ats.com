import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import type { Context } from "node:vm";

import { OK } from "zod/v3";

export function getValidationErrors(issues: any[] = []) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path ?? [];

    if (path.length > 0) {
      const field = path.join(".");
      // const field = String(path[path.length - 1]);
      errors[field] = issue.message;
    }
  }
  return errors;
}
const onError: ErrorHandler = (err: any, c: Context) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== OK
    ? (currentStatus as StatusCode)
    : 500;
  return c.json(
    {
      success: false,
      status: statusCode,
      message: err.message || "Internal server error",
      errors: err.errors,
    },
    statusCode as ContentfulStatusCode,
  );
};

export default onError;
