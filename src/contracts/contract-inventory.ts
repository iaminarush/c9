import { itemSchema } from "@/server/db/schema";
import {
  createInventorySchema,
  inventorySchema,
  updateInventorySchema,
} from "@/server/db/schema/inventory";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const inventoryDetailSchema = inventorySchema.merge(
  z.object({ item: itemSchema }),
);

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
  getInventories: {
    method: "GET",
    path: "/inventory",
    responses: {
      200: inventorySchema.array(),
      404: z.null(),
    },
    query: z.object({
      item: z.number(),
    }),
  },
  editInventory: {
    method: "PATCH",
    path: "/inventory/:id",
    responses: {
      200: inventorySchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: updateInventorySchema,
    summary: "Update inventory",
  },
  deleteInventory: {
    method: "DELETE",
    path: "/inventory/:id",
    body: z.any(),
    responses: {
      200: inventorySchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Delete a record",
  },
  getAllInventory: {
    method: "GET",
    path: "/all-inventory",
    responses: {
      200: inventoryDetailSchema.array(),
      404: z.null(),
    },
  },
});
