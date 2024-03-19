import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { stores } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";

export const storesRouter = createNextRoute(contract.stores, {
  getStores: async () => {
    const result = await db.query.stores.findMany();

    if (result) {
      return { status: 200, body: result };
    } else {
      return {
        status: 404,
        body: null,
      };
    }
  },
  getStoresFormatted: async () => {
    const result = await db.query.stores.findMany();

    if (result) {
      return {
        status: 200,
        body: result.map((s) => ({ value: `${s.id}`, label: s.name })),
      };
    } else {
      return { status: 404, body: null };
    }
  },
  getStore: async (args) => {
    if (isNumber(args.params.id)) {
      const result = await db.query.stores.findFirst({
        where: eq(stores.id, Number(args.params.id)),
      });

      if (result) {
        return { status: 200, body: result };
      }
    }

    return { status: 404, body: null };
  },
});
