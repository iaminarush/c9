import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { inventory } from "@/server/db/schema/inventory";
import { createNextRoute } from "@ts-rest/next";
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
});
