import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { records } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";

export const recordsRouter = createNextRoute(contract.records, {
  createRecord: async (args) => {
    const [newRecord] = await db.insert(records).values(args.body).returning();

    return newRecord
      ? { status: 201, body: newRecord }
      : { status: 400, body: { message: "Error" } };
  },
});
