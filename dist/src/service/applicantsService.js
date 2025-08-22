import { and, count, desc, eq } from "drizzle-orm";
import db from "../database/configuration.js";
import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";
export async function getAllApplicants() {
    return await db.select().from(applicants);
}
export async function createApplicant(reqBody) {
    try {
        const result = await db.insert(applicants)
            .values({
            first_name: reqBody.first_name,
            last_name: reqBody.last_name,
            email: reqBody.email,
            phone: reqBody.phone,
            role: reqBody.role ?? "Applicant",
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
export async function getApplicantById(id) {
    return await db.select().from(applicants).where(eq(applicants.id, id));
}
export async function checkApplicantByEmail(email) {
    const result = await db
        .select()
        .from(applicants)
        .where(eq(applicants.email, email));
    return result.length > 0;
}
export async function checkApplicantByPhone(phone) {
    const result = await db
        .select()
        .from(applicants)
        .where(eq(applicants.phone, phone));
    return result.length > 0;
}
export async function checkApplicantResumeKey(resume_key_path) {
    const result = await db
        .select()
        .from(applicants)
        .where(eq(applicants.resume_key_path, resume_key_path));
    return result.length > 0;
}
export async function updateStatusApplicant(id, status) {
    return await db.update(applicants).set({ status }).where(eq(applicants.id, id)).returning();
}
export async function listApplicants(filters, offset, limit) {
    const result = await db.select({ firstname: applicants.first_name, email: applicants.email, phone: applicants.phone, id: applicants.id, role: applicants.role, status: applicants.status, created_at: applicants.created_at, updated_at: applicants.updated_at, deleted_at: applicants.deleted_at })
        .from(applicants)
        .where(and(...filters))
        .offset(offset)
        .limit(limit)
        .orderBy(desc(applicants.created_at));
    return result;
}
export async function getRecordsCount(table, filters) {
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
export async function getAllComments(filters, offset, limit, userId) {
    const result = await db.select({
        id: comments.id,
        comment_description: comments.comment_description,
        commented_by: comments.commented_by,
        commented_at: comments.commented_at,
    })
        .from(comments)
        .where(and(...filters, eq(comments.commented_by, userId)))
        .offset(offset)
        .limit(limit);
    return result;
}
