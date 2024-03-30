import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { barcodes } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
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
});
