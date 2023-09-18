import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env.mjs";
import * as categories from "./schema/categories";
import * as items from "./schema/items";
import * as accounts from "./schema/accounts";
import * as prices from "./schema/prices";
import * as stores from "./schema/stores";

neonConfig.fetchConnectionCache = true;

const schema = { ...accounts, ...categories, ...items, ...prices, ...stores };

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
// export const db = drizzle(sql);
