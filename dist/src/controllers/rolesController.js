import { ADD_ROLE_VALIDATION_CRITERIA, ROLE_CREATED, ROLE_EXISTED, ROLE_NOT_FOUND, ROLE_UPDATED, ROLES_FETCHED } from "../constants/appMessages.js";
import { roles } from "../database/schemas/roles.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { getRecordsConditionally, getSingleRecordByAColumnValue, saveSingleRecord, updateRecordById } from "../service/db/baseDbService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";
class RolesController {
    addRole = async (c) => {
        const reqBody = await c.req.json();
        const validatedReqData = await validatedRequest("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);
        const existingRole = await getSingleRecordByAColumnValue(roles, "role", validatedReqData.role.toLowerCase(), ["LOWER"]);
        if (existingRole) {
            throw new ConflictException(ROLE_EXISTED);
        }
        const newRole = await saveSingleRecord(roles, validatedReqData);
        return sendResponse(c, 201, ROLE_CREATED, newRole);
    };
    listRoles = async (c) => {
        const orderByQueryData = { columns: ["role"], values: ["asc"] };
        const allRoles = await getRecordsConditionally(roles, null, null, orderByQueryData);
        return sendResponse(c, 200, ROLES_FETCHED, allRoles);
    };
    editRoleById = async (c) => {
        const roleId = c.req.param("id");
        const reqBody = await c.req.json();
        const validatedReqData = await validatedRequest("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);
        const existingRole = await getSingleRecordByAColumnValue(roles, "id", roleId);
        if (!existingRole) {
            throw new NotFoundException(ROLE_NOT_FOUND);
        }
        const updatedRole = await updateRecordById(roles, +roleId, validatedReqData);
        return sendResponse(c, 200, ROLE_UPDATED, updatedRole);
    };
}
export default RolesController;
