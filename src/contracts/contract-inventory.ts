import {
  createInventorySchema,
  inventorySchema,
} from "@/server/db/schema/inventory";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const inventoryContract = c.router({
  createInventory: {
    method: "POST",
    path: "/inventory",
    responses: {
      201: inventorySchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: createInventorySchema,
    summary: "Add inventory",
  },
});
