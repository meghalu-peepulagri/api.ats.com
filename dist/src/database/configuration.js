import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { dbConfig } from "../config/dbConfig.js";
import * as applicants from "./schemas/applicants.js";
import * as comments from "./schemas/comments.js";
import * as users from "./schemas/users.js";
const { Pool } = pg;
const dbClient = new Pool({
    connectionString: dbConfig.connectionString,
});
const db = drizzle(dbClient, {
    schema: {
        ...applicants,
        ...comments,
        ...users,
    },
});
export default db;
