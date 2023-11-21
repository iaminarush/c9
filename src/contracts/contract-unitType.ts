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
});
