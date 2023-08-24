import { Config } from "drizzle-kit";
import { env } from "./src/env.mjs";

export default {
  schema: "./src/server/db/schema/*.ts",
  driver: "pg",
  dbCredentials: {
    // connectionString: process.env.DATABASE_URL!,
    connectionString: "",
  },
} satisfies Config;
