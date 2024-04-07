import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { stores } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

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
        body: result.map((s) => ({
          value: `${s.id}`,
          label: s.name,
          image: s.image,
        })),
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
  updateStore: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    if (isNumber(args.params.id)) {
      const [updateStore] = await db
        .update(stores)
        .set(args.body)
        .where(eq(stores.id, Number(args.params.id)))
        .returning();

      if (updateStore) {
        return { status: 200, body: updateStore };
      }
    }

    return { status: 404, body: { message: "Store not found" } };
  },
  addStore: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newStore] = await db.insert(stores).values(args.body).returning();

    return newStore
      ? { status: 201, body: newStore }
      : { status: 400, body: { message: "Error" } };
  },
});
