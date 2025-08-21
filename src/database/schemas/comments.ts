import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { applicants } from "./applicants.js";
import { users } from "./users.js";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  applicant_id: integer("applicant_id").references(() => applicants.id),
  comment_description: text("comment_description"),
  commented_by: text("commented_by").references(() => users.id),
  commented_at: timestamp("commented_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  deleted_at: timestamp("deleted_at"),
}, t => [
  index("comments_applicant_id_idx").on(t.applicant_id),
  index("comments_commented_by_idx").on(t.commented_by),
]);

export type CommentsTable = typeof comments;
export type Comments = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
