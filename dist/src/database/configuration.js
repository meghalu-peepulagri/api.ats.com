import { drizzle } from "drizzle-orm/node-postgres";
import fs from "node:fs";
import pg from "pg";
import env from "../env.js";
const { Pool } = pg;
const dbClient = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString(),
    },
});
const db = drizzle(dbClient);
export default db;
