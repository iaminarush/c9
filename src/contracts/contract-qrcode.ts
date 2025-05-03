import {
  createQrcodeSchema,
  qrcodeSchema,
  updateQrcodeSchema,
} from "@/server/db/schema/qrcodes";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const qrcodeContract = c.router({
  getQrcodes: {
    method: "GET",
    path: "/qrcodes",
    responses: {
      200: qrcodeSchema.array(),
      404: null,
    },
  },
  getQrcode: {
    method: "GET",
    path: "/qrcodes/:id",
    responses: {
      200: qrcodeSchema,
      404: null,
    },
  },
  updateQrcode: {
    method: "PATCH",
    path: "/qrcodes/:id",
    responses: {
      200: qrcodeSchema,
      403: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    body: updateQrcodeSchema,
    summary: "Update a Qrcode",
  },
  addQrcode: {
    method: "POST",
    path: "/qrcodes",
    responses: {
      201: qrcodeSchema,
      400: z.object({ message: z.string() }),
      403: z.object({ message: z.string() }),
    },
    body: createQrcodeSchema,
    summary: "Add a Qrcode",
  },
});
