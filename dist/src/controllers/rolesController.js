import { ADD_ROLE_VALIDATION_CRITERIA, ROLE_CREATED, ROLE_EXISTED } from "../constants/appMessages.js";
import { roles } from "../database/schemas/roles.js";
import ConflictException from "../exceptions/conflictException.js";
import { getRecordsConditionally, getSingleRecordByAColumnValue, saveSingleRecord } from "../service/db/baseDbService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";
class RolesController {
    addRole = async (c) => {
        const reqBody = await c.req.json();
        const validatedReqData = await validatedRequest("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);
        const existingRole = await getSingleRecordByAColumnValue(roles, "role", validatedReqData.role.toUpperCase());
        if (existingRole) {
            throw new ConflictException(ROLE_EXISTED);
        }
        const newRole = await saveSingleRecord(roles, validatedReqData);
        return sendResponse(c, 201, ROLE_CREATED, newRole);
    };
    listRoles = async (c) => {
        const allRoles = await getRecordsConditionally(roles);
        return sendResponse(c, 200, "Roles fetched successfully", allRoles);
    };
}
export default RolesController;
