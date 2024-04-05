import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { items } from "@/server/db/schema/items";
import { createNextRoute } from "@ts-rest/next";
import { eq, isNull } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const itemsRouter = createNextRoute(contract.items, {
  createItem: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newItem] = await db.insert(items).values(args.body).returning();

    return newItem
      ? { status: 201, body: newItem }
      : { status: 400, body: { message: "Error" } };
  },
  getItem: async (args) => {
    if (isNumber(args.params.id)) {
      const item = await db.query.items.findFirst({
        where: eq(items.id, Number(args.params.id)),
      });

      if (item) {
        return { status: 200, body: item };
      }
    }

    return { status: 404, body: { message: "Item not found" } };
  },
  getUncategorizedItems: async (args) => {
    const uncategorizedItems = await db.query.items.findMany({
      where: isNull(items.category),
    });

    return { status: 200, body: uncategorizedItems };
  },
});
