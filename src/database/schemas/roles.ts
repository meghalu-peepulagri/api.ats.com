import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
},t=>[
   index("roles_id_idx").on(t.id),
   index("roles_role_idx").on(t.role),
]);

export type RolesTable = typeof roles;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;