import { boolean, index, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone").unique(),
  password: text("password").notNull().unique(),
  user_type: varchar("user_type").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  deleted_at: timestamp("deleted_at"),
}, t => [
  index("users_id_idx").on(t.id),
  index("users_email_idx").on(t.email),
  index("users_name_idx").on(t.name),
]);

export type UsersTable = typeof users;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
