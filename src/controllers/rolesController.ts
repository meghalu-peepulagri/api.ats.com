import type { Context } from "hono";
import { safeParse } from "zod";
import { vAddRole, type TCreateRole } from "../validations/schema/addRoleSchema.js";
import UnprocessableContentException from "../exceptions/unProcessableContentException.js";
import { ADD_ROLE_VALIDATION_CRITERIA, ROLE_CREATED, ROLE_EXISTED } from "../constants/appMessages.js";
import { getRecordsConditionally, getSingleRecordByAColumnValue, saveSingleRecord } from "../service/db/baseDbService.js";
import { validatedRequest } from "../validations/validateRequest.js";
import { roles, type Role } from "../database/schemas/roles.js";
import { sendResponse } from "../utils/sendResponse.js";
import ConflictException from "../exceptions/conflictException.js";

class RolesController {

  addRole = async (c: Context) => {
    const reqBody = await c.req.json();
    const validatedReqData = await validatedRequest<TCreateRole>("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);

    const existingRole = await getSingleRecordByAColumnValue<Role>(roles, "role", validatedReqData.role.toLowerCase(), "LOWER");
    if (existingRole) {
      throw new ConflictException(ROLE_EXISTED);
    }

    const newRole = saveSingleRecord(roles, validatedReqData);

    return sendResponse(c, 201, ROLE_CREATED, newRole);
  }

  listRoles = async (c: Context) => {
    const allRoles = await getRecordsConditionally<Role>(roles);
    return sendResponse(c, 200, "Roles fetched successfully", allRoles);
  }
}

export default RolesController;
