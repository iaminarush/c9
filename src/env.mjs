import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    UPLOADTHING_SECRET: z.string(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
