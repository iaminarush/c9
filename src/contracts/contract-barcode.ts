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
      403: z.object({ message: z.string() }),
    },
    body: createBarcodeSchema,
    summary: "Create a barcode",
  },
  getAllBarcodesByItem: {
    method: "GET",
    path: "/barcodes-by-item",
    query: z.object({ itemId: z.number() }),
    responses: {
      200: barcodeSchema.array(),
      404: z.object({ message: z.string() }),
    },
    summary: "Get all barcodes by item id",
  },
  deleteBarcode: {
    method: "DELETE",
    path: "/barcodes/:id",
    body: z.any(),
    responses: {
      200: barcodeSchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: "Delete a barcode",
  },
});
