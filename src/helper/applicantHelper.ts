import type { SQL } from "drizzle-orm";

import { sql } from "drizzle-orm";

import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";

export class ApplicantHelper {
  applicants = async (query: any) => {
    const filters: SQL[] = [];

    const search_string = query?.search_string || null;
    const status = query?.status || null;
    const role = query?.role || null;
    if (search_string?.trim()) {
      const searchTerm = `%${search_string.trim().replace(/\s+/g, "%")}%`;
      filters.push(
        sql`(${applicants.first_name} ILIKE ${searchTerm} OR ${applicants.email} ILIKE ${searchTerm} OR ${applicants.phone} ILIKE ${searchTerm})`,
      );
    }
    if (status?.trim()) {
      filters.push(sql`${applicants.status} ILIKE ${`%${status}%`}`);
    }
    if (role?.trim()) {
      filters.push(sql`${applicants.role} ILIKE ${`%${role}%`}`);
    }
    return filters;
  };

  comments = async (query: any) => {
    const filters: SQL[] = [];
    const search_string = query?.search_string || null;
    if (search_string?.trim()) {
      const searchTerm = `%${search_string.trim().replace(/\s+/g, "%")}%`;
      filters.push(sql`(${comments.comment_description} ILIKE ${searchTerm})`);
    }
    return filters;
  };

  getPaginationData = (page: number, pageSize: number, totalRecords: number) => {
    const limit = pageSize ? +pageSize : 10;
    const totalPages = Math.ceil(totalRecords / limit);
    return {
      total_records: Number(totalRecords),
      total_pages: totalPages,
      page_size: limit,
      current_page: page,
      next_page: page < totalPages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null,
    };
  };

  listApplicants = (query) => {
    const filters: SQL[] = [];
    const search_string = query?.search_string || null;
    const status = query?.status || null;
    if (search_string?.trim()) {
      const searchTerm = `%${search_string.trim().replace(/\s+/g, "%")}%`;
      filters.push(sql`(${applicants.first_name} ILIKE ${searchTerm} OR ${applicants.email} ILIKE ${searchTerm} OR ${applicants.phone} ILIKE ${searchTerm})`);
    }
    if (status?.trim()) {
      filters.push(sql`${applicants.status} ILIKE ${`%${status}%`}`);
    }
    return filters;
  };
}
