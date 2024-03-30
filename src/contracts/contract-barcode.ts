import { barcodeSchema, createBarcodeSchema } from "@/server/db/schema";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const barcodeContract = c.router({
  createBarcode: {
    method: "POST",
    path: "/barcodes",
    responses: {
      201: barcodeSchema,
      400: z.object({ message: z.string() }),
    },
    body: createBarcodeSchema,
    summary: "Create a barcode",
  },
});
