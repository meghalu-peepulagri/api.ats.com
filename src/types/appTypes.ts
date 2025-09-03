import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { Applicant, ApplicantTable } from "../database/schemas/applicants.js";
import type { Comments, CommentsTable } from "../database/schemas/comments.js";
import type { User, UsersTable } from "../database/schemas/users.js";
import type { ValidateCreateSchema } from "../validations/schema/addCommentSchema.js";
import type { TCreateRole } from "../validations/schema/addRoleSchema.js";
import type { TCreateApplicant } from "../validations/schema/createApplicantValidation.js";
import type { VCreateUserSchema, VUserLoginSchema } from "../validations/schema/createUserValidation.js";

export type ValidatedRequest = TCreateApplicant | VCreateUserSchema | VUserLoginSchema | ValidateCreateSchema | TCreateRole;

export type AppActivity = "add-applicant" | "add-user" | "login" | "add-comment" | "add-role";

export type DBTable = ApplicantTable;
export type DBRecord<T extends DBTable>
  = T extends ApplicantTable ? Applicant
    : T extends UsersTable ? User
      : T extends CommentsTable ? Comments : null;

export interface IResp {
  status: ContentfulStatusCode;
  success: boolean;
  message: string;
}

export interface IRespWithData<T = unknown> extends IResp {
  data: T;
}

export interface PaginationInfo {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface PaginatedRecords<T extends DBTable> {
  pagination_info: PaginationInfo;
  records: DBRecord<T>[];
}
