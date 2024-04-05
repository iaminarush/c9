// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { env } from "@/env.mjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";


const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
  logger: false,
});
