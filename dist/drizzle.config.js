import { defineConfig } from "drizzle-kit";
/* eslint-disable node/no-process-env */
export default defineConfig({
    dialect: "postgresql",
    schema: "./dist/src/database/schemas/*",
    out: "./migrations",
    dbCredentials: {
        // host: process.env.DB_HOST!,
        // port: Number(process.env.DB_PORT!),
        // user: process.env.DB_USER!,
        // password: process.env.DB_PASSWORD!,
        // database: process.env.DB_NAME!,
        url: process.env.DATABASE_URL,
        // ssl: {
        //   rejectUnauthorized: true,
        //   ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString(),
        // }
    },
});
