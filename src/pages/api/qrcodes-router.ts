import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { qrcodes } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const qrcodeRouter = createNextRoute(contract.qrcodes, {
  getQrcodes: async () => {
    const result = await db.query.qrcodes.findMany();

    if (result) {
      return { status: 200, body: result };
    } else {
      return {
        status: 404,
        body: null,
      };
    }
  },
  getQrcode: async (args) => {
    if (isNumber(args.params.id)) {
      const result = await db.query.qrcodes.findFirst({
        where: eq(qrcodes.id, Number(args.params.id)),
      });

      if (result) {
        return { status: 200, body: result };
      }
    }

    return { status: 404, body: null };
  },
  updateQrcode: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    if (isNumber(args.params.id)) {
      const [updateQrcode] = await db
        .update(qrcodes)
        .set(args.body)
        .where(eq(qrcodes.id, Number(args.params.id)))
        .returning();

      if (updateQrcode) {
        return { status: 200, body: updateQrcode };
      }
    }

    return { status: 404, body: { message: "Store not found" } };
  },
  addQrcode: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newQrcode] = await db.insert(qrcodes).values(args.body).returning();

    return newQrcode
      ? { status: 201, body: newQrcode }
      : { status: 400, body: { message: "Error" } };
  },
});
