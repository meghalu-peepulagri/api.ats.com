import type { Applicant, ApplicantTable, NewApplicant } from "../database/schemas/applicants.js";
import type { Comments, CommentsTable, NewComment } from "../database/schemas/comments.js";
import type { NewUser, User, UsersTable } from "../database/schemas/users.js";

export type DBTable = ApplicantTable | UsersTable | CommentsTable;
export type DBTableRow = Applicant | User | Comments;
export type DBNewRecord = NewApplicant | NewUser | NewComment;
export type DBNewRecords = NewApplicant[] | NewUser[] | NewComment[];

export type DBTableColumns<T extends DBTableRow> = keyof T;
export type SortDirection = "asc" | "desc";

export interface WhereQueryData<T extends DBTableRow> {
  columns: Array<keyof T>;
  values: any[];
  operators?: Array<"eq" | "ne" | "LOWER" | "isNull">;
}

export interface OrderByQueryData<T extends DBTableRow> {
  columns: Array<DBTableColumns<T>>;
  values: SortDirection[];
}

export interface InQueryData<T extends DBTableRow> {
  key: keyof T;
  values: any[];
}

export type UpdateRecordData<R extends DBTableRow> = Partial<Omit<R, "id" | "created_at" | "updated_at">>;

export interface PaginationInfo {
  total_records: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface PaginatedRecords<T extends DBTableRow> {
  pagination_info: PaginationInfo;
  records: T[];
}
