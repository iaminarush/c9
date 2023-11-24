import { selectSchema } from "@/lib/zodScehmas";
import { unitTypesSchema } from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const unitTypesContract = c.router({
  getUnitTypes: {
    method: "GET",
    path: "/unit-types",
    responses: {
      200: unitTypesSchema.array(),
      404: z.null(),
    },
  },
  getUnitTypesFormatted: {
    method: "GET",
    path: "/unit-types-formatted",
    responses: {
      200: selectSchema.extend({ unitFamilyId: z.number() }).array(),
      404: z.null(),
    },
  },
});
