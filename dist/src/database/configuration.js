import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { dbConfig } from "../config/dbConfig.js";
import * as applicants from "./schemas/applicants.js";
import * as comments from "./schemas/comments.js";
import * as users from "./schemas/users.js";
const { Pool } = pg;
const dbClient = new Pool({
    // host: dbConfig.host,
    // port: dbConfig.port,
    // user: dbConfig.user,
    // password: dbConfig.password,
    // database: dbConfig.database,
    connectionString: dbConfig.connectionString,
    // ssl: {
    //   rejectUnauthorized: true,
    //   ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString(),
    // },
});
const db = drizzle(dbClient, {
    schema: {
        ...applicants,
        ...comments,
        ...users,
    },
});
export default db;
