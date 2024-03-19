import { selectSchema } from "@/lib/zodScehmas";
import { storeSchema, updateStoreSchema } from "@/server/db/schema";
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
      200: selectSchema.array(),
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
});
