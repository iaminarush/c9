import { createItemSchema, itemSchema } from "@/server/db/schema/items";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const itemContract = c.router({
  createItem: {
    method: "POST",
    path: "/items",
    responses: {
      201: itemSchema,
      400: z.object({ message: z.string() }),
      404: z.null(),
    },
    body: createItemSchema,
    summary: "Create a item",
    metadata: { roles: ["user"] } as const,
  },
});
