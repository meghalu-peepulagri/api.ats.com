import UnprocessableEntityException from "../exceptions/unProcessableEntityException.js";
import { getValidationErrors } from "../utils/onError.js";
import { vAddComment } from "./schema/addCommentSchema.js";
import { vCreateApplicant } from "./schema/applicants.js";
import { VCreateUser, vUserLogin } from "./schema/createUserValidation.js";
const schemaMap = {
    "add-applicant": vCreateApplicant,
    "add-user": VCreateUser,
    "login": vUserLogin,
    "add-comment": vAddComment,
};
export async function validatedRequest(actionType, reqData, errorMessage) {
    const schema = schemaMap[actionType];
    const validation = await schema?.safeParseAsync(reqData);
    if (!validation?.success) {
        throw new UnprocessableEntityException(errorMessage, getValidationErrors(validation?.error.issues));
    }
    return validation.data;
}
