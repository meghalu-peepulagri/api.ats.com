import { index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
export const applicants = pgTable("applicants", {
    id: serial("id").primaryKey(),
    first_name: text("first_name"),
    last_name: text("last_name"),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    role: varchar("role"),
    status: varchar("status"),
    // education: text("education"),
    // salary_expectation: text("salary_expectation"),
    resume_key_path: text("resume_key_path").unique(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
    deleted_at: timestamp("deleted_at"),
}, t => [
    index("applicants_id_idx").on(t.email),
    index("applicants_first_name_idx").on(t.phone),
]);
