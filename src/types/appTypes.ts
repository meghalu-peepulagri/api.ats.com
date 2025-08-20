import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Applicants, ApplicantTable } from "../database/schemas/applicants.js";
export type DBTable = Applicants;
export type DBRecord<T extends DBTable>
  = T extends ApplicantTable ? Applicants:null

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