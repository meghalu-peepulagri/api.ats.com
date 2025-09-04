import { and, asc, count, desc, eq, sql } from "drizzle-orm";

import type { NewApplicant } from "../database/schemas/applicants.js";

import db from "../database/configuration.js";
import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";
import { roles } from "../database/schemas/roles.js";

export async function getAllApplicants() {
  return await db.select().from(applicants);
}
export async function createApplicant(reqBody: NewApplicant) {
  try {
    const result = await db.insert(applicants)
      .values({
        first_name: reqBody.first_name,
        last_name: reqBody.last_name,
        email: reqBody.email,
        phone: reqBody.phone,
        role_id: reqBody.role_id,
        status: reqBody.status ?? "pending",
        resume_key_path: reqBody.resume_key_path,
      })

      .returning();
    return result;
  }
  catch (err) {
    throw new Error(err);
  }
}

export async function getApplicantById(id: number) {
  return await db.select().from(applicants).where(eq(applicants.id, id));
}

export async function checkApplicantByEmail(email: string) {
  const result = await db
    .select()
    .from(applicants)
    .where(eq(applicants.email, email));
  return result.length > 0;
}

export async function checkApplicantByPhone(phone: string) {
  const result = await db
    .select()
    .from(applicants)
    .where(eq(applicants.phone, phone));
  return result.length > 0;
}

export async function checkApplicantResumeKey(resume_key_path: string) {
  const result = await db
    .select()
    .from(applicants)
    .where(eq(applicants.resume_key_path, resume_key_path));
  return result.length > 0;
}

export async function updateStatusApplicant(id: number, status: string) {
  return await db.update(applicants).set({ status }).where(eq(applicants.id, id)).returning();
}

export async function listApplicants(filters: any, offset: number, limit: number) {
  const result = await db.select({ firstname: applicants.first_name, lastName: applicants.last_name, email: applicants.email, phone: applicants.phone, id: applicants.id, role: roles.role, status: applicants.status, created_at: applicants.created_at, updated_at: applicants.updated_at, deleted_at: applicants.deleted_at })
    .from(applicants)
    .where(and(...filters))
    .leftJoin(roles, eq(applicants.role_id, roles.id))
    .offset(offset)
    .limit(limit)
    .orderBy(desc(applicants.created_at));
  return result;
}

export async function getRecordsCount(table: any, filters?: any) {
  const intialQuery = db.select({ total: count() }).from(table);
  let finalQuery;

  if (filters && filters.length > 0) {
    finalQuery = intialQuery.where(and(...filters));
  }
  else {
    finalQuery = intialQuery;
  }
  const result = await finalQuery;

  return result[0].total;
}

export async function getAllComments(filters: any, offset: number, limit: number, applicantId: number) {
  const result = await db.query.comments.findMany({
    where: and(...filters, eq(comments.applicant_id, applicantId)),
    offset,
    limit,
    orderBy: [asc(comments.commented_at)],
    columns: {
      id: true,
      comment_description: true,
      commented_by: true,
      commented_at: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
}

export async function applicantsStats() {
  const query = sql`with dummy as (
  select * from applicants where ${applicants.deleted_at} is null
  )  select status , count(*) as count from dummy group by status
    `;
  const applicantsData = await db.execute(query);
  const stats: Record<string, number> = {};
  applicantsData.rows.forEach((row: any) => {
    stats[row.status] = Number(row.count);
  });
  const totalApplicants = applicantsData.rows.map((row: any) => Number(row.count)).reduce((acc, count) => acc + count, 0);
  const screenedCount = (stats.SCREENED || 0) + (stats.HIRED || 0) + (stats.JOINED || 0) + (stats.REJECTED || 0) + (stats.INTERVIEWED || 0) + (stats.SCHEDULE_INTERVIEW || 0);
  return {
    totalApplicants,
    applied: stats.APPLIED || 0,
    screened: screenedCount,
    hired: stats.HIRED || 0,
    rejected: stats.REJECTED || 0,
    interviewed: stats.INTERVIEWED || 0,
    interview_scheduled: stats.SCHEDULE_INTERVIEW || 0,
    joined: stats.JOINED || 0,
  };
}

export async function getApplicantByIdWithRelations(id: number) {
  return await db.query.applicants.findFirst({
    where: eq(applicants.id, id),
    with: {
      role: {
        columns: {
          id: true,
          role: true,
        },
      },
    },
  });
}
