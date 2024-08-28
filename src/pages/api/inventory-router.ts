import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { records } from "@/server/db/schema";
import { inventory } from "@/server/db/schema/inventory";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const inventoryRouter = createNextRoute(contract.inventory, {
  createInventory: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newInventory] = await db
      .insert(inventory)
      .values(args.body)
      .returning();

    return newInventory
      ? { status: 201, body: newInventory }
      : { status: 400, body: { message: "Error" } };
  },
  getInventories: async (args) => {
    const result = await db.query.inventory.findMany({
      where: eq(records.itemId, Number(args.query.item)),
    });

    if (result) {
      return { status: 200, body: result };
    }
    return { status: 404, body: null };
  },
});
