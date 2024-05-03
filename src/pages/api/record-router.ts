import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { records } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const recordRouter = createNextRoute(contract.records, {
  createRecord: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newRecord] = await db
      .insert(records)
      .values(args.body)
      .returning({ id: records.id });

    if (newRecord) {
      const createdRecord = await db.query.records.findFirst({
        where: eq(records.id, newRecord.id),
        with: { store: true, unitType: { with: { unitFamily: true } } },
      });

      if (createdRecord) {
        return { status: 201, body: createdRecord };
      }
    }

    return { status: 400, body: { message: "Error" } };
  },
  getRecords: async (args) => {
    const result = await db.query.records.findMany({
      where: eq(records.itemId, Number(args.query.item)),
      with: {
        store: true,
        unitType: { with: { unitFamily: true } },
      },
    });


    if (result) {
      return { status: 200, body: result };
    }
    return { status: 404, body: null };
  },
  editRecord: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    await db
      .update(records)
      .set(args.body)
      .where(eq(records.id, Number(args.params.id)));

    const updatedRecord = await db.query.records.findFirst({
      where: eq(records.id, Number(args.params.id)),
      with: {
        store: true,
        unitType: { with: { unitFamily: true } },
      },
    });

    return updatedRecord
      ? { status: 200, body: updatedRecord }
      : { status: 400, body: { message: "Error" } };
  },
  deleteRecord: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [deletedRecord] = await db
      .delete(records)
      .where(eq(records.id, Number(args.params.id)))
      .returning();

    return deletedRecord
      ? { status: 200, body: deletedRecord }
      : { status: 404, body: { message: "Error" } };
  },
});
