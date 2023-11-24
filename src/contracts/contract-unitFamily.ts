import { selectSchema } from "@/lib/zodScehmas";
import { unitFamilySchema } from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const unitFamiliesContract = c.router({
  getUnitFamilies: {
    method: "GET",
    path: "/unit-families",
    responses: {
      200: unitFamilySchema.array(),
      404: z.null(),
    },
  },
  getUnitFamiliesFormatted: {
    method: "GET",
    path: "/unit-families-formatted",
    responses: {
      200: selectSchema.array(),
      404: z.null(),
    },
  },
});
