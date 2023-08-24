import { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/server/db/schema/*.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: `${process.env.DATABASE_URL!}?sslmode=require`,
    ssl: true,
  },
} satisfies Config;
