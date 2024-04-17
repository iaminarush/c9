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
      403: z.object({ message: z.string() }),
    },
    body: createItemSchema,
    summary: "Create a item",
  },
  getItem: {
    method: "GET",
    path: "/items/:id",
    responses: {
      200: itemSchema,
      404: z.object({ message: z.string() }),
    },
    summary: "Get a item by id",
  },
  getUncategorizedItems: {
    method: "GET",
    path: "/uncategorized-items",
    responses: {
      200: itemSchema.array(),
      404: z.object({ message: z.string() }),
    },
    summary: "Get items with no category",
  },
  deleteItem: {
    method: "DELETE",
    path: "/items/:id",
    body: z.any(),
    responses: {
      200: itemSchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Delete an item",
  },
  searchItemByBarcode: {
    method: "GET",
    path: "/items-by-barcode/:barcode",
    responses: { 200: itemSchema, 404: z.object({ message: z.string() }) },
    summary: "Find item by barcode",
  },
  updateItem: {
    method: "PATCH",
    path: "/items/:id",
    body: itemSchema,
    responses: {
      201: itemSchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    summary: "Update item",
  },
});
