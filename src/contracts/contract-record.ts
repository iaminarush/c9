import { createRecordSchema, recordSchema } from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const recordContract = c.router({
  createRecord: {
    method: "POST",
    path: "/records",
    responses: {
      201: recordSchema,
      400: z.object({ message: z.string() }),
    },
    body: createRecordSchema,
    summary: "Create a record for an item",
  },
});
