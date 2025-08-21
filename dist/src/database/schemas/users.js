import { boolean, index, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
export const userTypeEnum = pgEnum("user_type", ["HR", "ADMIN"]);
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    user_type: userTypeEnum("user_type").notNull(),
    is_active: boolean("is_active").default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
    deleted_at: timestamp("deleted_at"),
}, t => [
    index("users_email_idx").on(t.email),
    index("users_name_idx").on(t.name),
]);
