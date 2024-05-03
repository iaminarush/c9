import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { barcodes } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const barcodeRouter = createNextRoute(contract.barcodes, {
  createBarcode: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newBarcode] = await db
      .insert(barcodes)
      .values(args.body)
      .returning();

    return newBarcode
      ? { status: 201, body: newBarcode }
      : { status: 400, body: { message: "Error" } };
  },
  getAllBarcodesByItem: async (args) => {
    const result = await db.query.barcodes.findMany({
      where: eq(barcodes.itemId, args.query.itemId),
    });

    return result
      ? { status: 200, body: result }
      : { status: 404, body: { message: "Error" } };
  },
  deleteBarcode: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [deletedBarcode] = await db
      .delete(barcodes)
      .where(eq(barcodes.id, Number(args.params.id)))
      .returning();

    return deletedBarcode
      ? { status: 200, body: deletedBarcode }
      : { status: 404, body: { message: "Error" } };
  },
});
