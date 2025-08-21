import UnprocessableEntityException from "../exceptions/unProcessableEntityException.js";
import { getValidationErrors } from "../utils/onError.js";
import { vCreateApplicant } from "./applicants.js";
const schemaMap = {
    "add-applicant": vCreateApplicant,
};
export async function validatedRequest(actionType, reqData, errorMessage) {
    const schema = schemaMap[actionType];
    const validation = await schema?.safeParseAsync(reqData);
    if (!validation?.success) {
        throw new UnprocessableEntityException(errorMessage, getValidationErrors(validation?.error.issues));
    }
    return validation.data;
}
