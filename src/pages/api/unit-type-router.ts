import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { createNextRoute } from "@ts-rest/next";

export const unitTypeRouter = createNextRoute(contract.unitTypes, {
  getUnitTypes: async () => {
    const result = await db.query.unitTypes.findMany();

    if (result) {
      return { status: 200, body: result };
    } else {
      return { status: 404, body: null };
    }
  },
  getUnitTypesFormatted: async () => {
    const result = await db.query.unitTypes.findMany({
      columns: { id: true, name: true },
      with: {
        unitFamily: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (result) {
      return {
        status: 200,
        body: result.map((ut) => ({
          value: `${ut.id}`,
          label: ut.name,
          unitFamilyId: ut.unitFamily.id,
        })),
      };
    } else {
      return { status: 404, body: null };
    }
  },
});
