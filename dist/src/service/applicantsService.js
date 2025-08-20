import { and, count, eq } from "drizzle-orm";
import db from "../database/configuration.js";
import { applicants } from "../database/schemas/applicants.js";
export async function getAllApplicants() {
    return await db.select().from(applicants);
}
export async function createApplicant(reqBody) {
    return await db.insert(applicants)
        .values(reqBody).
        returning();
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
export async function updateStatusApplicant(id, status) {
    return await db.update(applicants).set({ status }).where(eq(applicants.id, id)).returning();
}
export async function listApplicants(filters, offset, limit) {
    const result = await db.select({ firstname: applicants.first_name, email: applicants.email, phone: applicants.phone, id: applicants.id, role: applicants.role, status: applicants.status, created_at: applicants.created_at, updated_at: applicants.updated_at, deleted_at: applicants.deleted_at }).from(applicants);
    return result;
}
export async function getRecordsCount(table, filters) {
    const intialQuery = db.select({ total: count() }).from(applicants);
    let finalQuery;
    if (filters && filters.length > 0) {
        finalQuery = intialQuery.where(and(...filters));
    }
    else {
        finalQuery = intialQuery;
    }
    const result = await finalQuery;
    console.log('result: ', result);
    return result[0].total;
}
