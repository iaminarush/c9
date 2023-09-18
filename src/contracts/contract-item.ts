import { itemSchema, items } from "@/server/db/schema/items";
import { initContract } from "@ts-rest/core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const c = initContract();

const insertItemSchema = itemSchema.omit({ id: true });

export const itemContract = c.router({
  createItem: {
    method: "POST",
    path: "/items",
    responses: {
      201: itemSchema,
      400: z.object({ message: z.string() }),
    },
    body: insertItemSchema,
    summary: "Create a item",
    metadata: { roles: ["user"] } as const,
  },
});
