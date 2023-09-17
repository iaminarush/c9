import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env.mjs";
import * as categories from "./schema/categories";
import * as items from "./schema/items";

neonConfig.fetchConnectionCache = true;

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema: { ...categories, ...items } });
