import { selectSchema } from "@/lib/zodScehmas";
import { storeSchema } from "@/server/db/schema";
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
});
