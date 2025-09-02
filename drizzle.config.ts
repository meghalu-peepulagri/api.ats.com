import { defineConfig } from "drizzle-kit";

/* eslint-disable node/no-process-env */
export default defineConfig({
  dialect: "postgresql",
  schema: "./dist/src/database/schemas/*",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
