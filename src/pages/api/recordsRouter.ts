import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { records } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";

export const recordsRouter = createNextRoute(contract.records, {
  createRecord: async (args) => {
    const [newRecord] = await db.insert(records).values(args.body).returning();

    return newRecord
      ? { status: 201, body: newRecord }
      : { status: 400, body: { message: "Error" } };
  },
  getRecords: async (args) => {
    console.log(typeof args.query.item, isNumber(args.query.item));
    if (isNumber(args.query.item)) {
      const result = await db.query.records.findMany({
        where: eq(records.itemId, Number(args.query.item)),
      });

      if (result) {
        return { status: 200, body: result };
      }
    }
    return { status: 404, body: null };
  },
});
