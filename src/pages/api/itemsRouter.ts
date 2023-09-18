import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { items } from "@/server/db/schema/items";
import { createNextRoute } from "@ts-rest/next";

export const itemsRouter = createNextRoute(contract.items, {
  createItem: async (args) => {
    const [newItem] = await db.insert(items).values(args.body).returning();

    return newItem
      ? { status: 201, body: newItem }
      : { status: 400, body: { message: "Error" } };
  },
});
