import { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  dialect: "postgresql",
  schema: "./src/server/db/schema/*",
  out: "./drizzle",
  dbCredentials: {
    url: `${process.env.DATABASE_URL!}?sslmode=require`,
    ssl: true,
  },
} satisfies Config;
