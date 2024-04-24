import {
  createRecordSchema,
  recordSchema,
  storeSchema,
  unitTypesSchema,
  updateRecordSchema,
} from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

export const recordDetailSchema = recordSchema.merge(
  z.object({
    store: storeSchema,
    unitType: unitTypesSchema,
  }),
);

const c = initContract();

export const recordContract = c.router({
  createRecord: {
    method: "POST",
    path: "/records",
    responses: {
      201: recordDetailSchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: createRecordSchema,
    summary: "Create a record for an item",
  },
  getRecords: {
    method: "GET",
    path: "/records",
    responses: {
      200: recordDetailSchema.array(),
      404: z.null(),
    },
    query: z.object({
      item: z.number(),
    }),
  },
  editRecord: {
    method: "PATCH",
    path: "/records/:id",
    responses: {
      200: recordDetailSchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: updateRecordSchema,
    summary: "Update record",
  },
  deleteRecord: {
    method: "DELETE",
    path: "/records/:id",
    body: z.any(),
    responses: {
      200: recordSchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Delete a record",
  },
});
