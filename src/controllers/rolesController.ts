import type { Context } from "hono";

import type { Role } from "../database/schemas/roles.js";
import type { OrderByQueryData } from "../types/dbTypes.js";
import type { TCreateRole } from "../validations/schema/addRoleSchema.js";

import { ADD_ROLE_VALIDATION_CRITERIA, ROLE_CREATED, ROLE_EXISTED, ROLE_NOT_FOUND, ROLE_UPDATED, ROLES_FETCHED } from "../constants/appMessages.js";
import { roles } from "../database/schemas/roles.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { getRecordsConditionally, getSingleRecordByAColumnValue, saveSingleRecord, updateRecordById } from "../service/db/baseDbService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";

class RolesController {
  addRole = async (c: Context) => {
    const reqBody = await c.req.json();
    const validatedReqData = await validatedRequest<TCreateRole>("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);

    const existingRole = await getSingleRecordByAColumnValue<Role>(roles, "role", validatedReqData.role.toLowerCase(), ["LOWER"]);
    if (existingRole) {
      throw new ConflictException(ROLE_EXISTED);
    }

    const newRole = await saveSingleRecord(roles, validatedReqData);

    return sendResponse(c, 201, ROLE_CREATED, newRole);
  };

  listRoles = async (c: Context) => {
    const orderByQueryData: OrderByQueryData<Role> = { columns: ["role"], values: ["asc"] };
    const allRoles = await getRecordsConditionally<Role>(roles, null, null, orderByQueryData);
    return sendResponse(c, 200, ROLES_FETCHED, allRoles);
  };

  editRoleById = async (c: Context) => {
    const roleId = c.req.param("id");
    const reqBody = await c.req.json();

    const validatedReqData = await validatedRequest<TCreateRole>("add-role", reqBody, ADD_ROLE_VALIDATION_CRITERIA);

    const existingRole = await getSingleRecordByAColumnValue<Role>(roles, "id", roleId);
    if (!existingRole) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }

    const updatedRole = await updateRecordById<Role>(roles, +roleId, validatedReqData);

    return sendResponse(c, 200, ROLE_UPDATED, updatedRole);
  };
}

export default RolesController;
