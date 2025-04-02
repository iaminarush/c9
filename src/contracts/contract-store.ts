import { selectSchema } from "@/lib/zodScehmas";
import {
  createStoreSchema,
  storeSchema,
  updateStoreSchema,
} from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const storeContract = c.router({
  getStores: {
    method: "GET",
    path: "/stores",
    responses: {
      200: storeSchema.array(),
      404: null,
    },
  },
  getStoresFormatted: {
    method: "GET",
    path: "/stores-formatted",
    responses: {
      200: selectSchema
        .extend({ image: z.string().nullable(), favourite: z.boolean() })
        .array(),
      404: null,
    },
  },
  getStore: {
    method: "GET",
    path: "/stores/:id",
    responses: {
      200: storeSchema,
      404: null,
    },
  },
  updateStore: {
    method: "PATCH",
    path: "/stores/:id",
    responses: {
      200: storeSchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    body: updateStoreSchema,
    summary: "Update a store",
  },
  addStore: {
    method: "POST",
    path: "/stores",
    responses: {
      201: storeSchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: createStoreSchema,
    summary: "Add a store",
  },
});
