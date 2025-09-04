import { index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { roles } from "./roles.js";
import { relations } from "drizzle-orm";
import { users } from "./users.js";

export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),

  first_name: text("first_name"),
  last_name: text("last_name"),
  email: text("email").notNull().unique(),
  phone: text("phone").unique(),
  role: varchar("role"),
  role_id: integer("role_id").references(() => roles.id),
  status: varchar("status"),
  education: text("education"),
  salary_expectation: text("salary_expectation"),
  experience: integer("experience"),

  resume_key_path: text("resume_key_path").unique(),
  created_by: integer("created_by").references(() => users.id),
  updated_by: integer("updated_by").references(() => users.id),

  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  deleted_at: timestamp("deleted_at"),
}, t => [
  index("applicants_id_idx").on(t.id),
  index("applicants_first_name_idx").on(t.first_name),
]);

export const applicantRelations = relations(applicants, ({ one }) => ({
  role: one(roles, {
    fields: [applicants.role_id],
    references: [roles.id],
  }),
}));

export type ApplicantTable = typeof applicants;
export type Applicant = typeof applicants.$inferSelect;
export type NewApplicant = typeof applicants.$inferInsert;
