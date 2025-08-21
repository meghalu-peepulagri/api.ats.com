import { OK } from "zod/v3";
export function getValidationErrors(issues = []) {
    const errors = {};
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
const onError = (err, c) => {
    const currentStatus = "status" in err
        ? err.status
        : c.newResponse(null).status;
    const statusCode = currentStatus !== OK
        ? currentStatus
        : 500;
    return c.json({
        success: false,
        status: statusCode,
        message: err.message || "Internal server error",
        errors: err.errors,
    }, statusCode);
};
export default onError;
