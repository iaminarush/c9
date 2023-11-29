import { unitTypesSchema } from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const unitTypesZod = z.object({
  label: z.enum(["g"]),
  value: z.string(),
  unitFamilyId: z.number(),
});

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
      // 200: unitTypesZod.extend({ unitFamilyId: z.number() }).array(),
      200: unitTypesZod.array(),
      404: z.null(),
    },
  },
});
