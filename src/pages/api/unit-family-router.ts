import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { createNextRoute } from "@ts-rest/next";

export const unitFamilyRouter = createNextRoute(contract.unitFamilies, {
  getUnitFamilies: async () => {
    const result = await db.query.unitFamilies.findMany();

    if (result) {
      return { status: 200, body: result };
    } else {
      return { status: 404, body: null };
    }
  },
  getUnitFamiliesFormatted: async () => {
    const result = await db.query.unitFamilies.findMany();

    if (result) {
      return {
        status: 200,
        body: result.map((uf) => ({ value: `${uf.id}`, label: uf.name })),
      };
    } else {
      return { status: 404, body: null };
    }
  },
});
