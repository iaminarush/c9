import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { createNextRoute } from "@ts-rest/next";

export const unitTypesRouter = createNextRoute(contract.unitTypes, {
  getUnitTypes: async () => {
    const result = await db.query.unitTypes.findMany();

    if (result) {
      return { status: 200, body: result };
    } else {
      return { status: 404, body: null };
    }
  },
});
