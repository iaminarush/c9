import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { createNextRoute } from "@ts-rest/next";

export const storesRouter = createNextRoute(contract.store, {
  getStores: async () => {
    const result = await db.query.stores.findMany();

    if (result) {
      return { status: 200, body: result };
    } else
      return {
        status: 400,
        body: { message: "Error" },
      };
  },
});
