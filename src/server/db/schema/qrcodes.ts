import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const qrcodes = pgTable("qrcodes", {
  id: serial("id").primaryKey(),
  data: text("data").notNull(),
});

export const qrcodeSchema = createSelectSchema(qrcodes);

export const createQrcodeSchema = createInsertSchema(qrcodes);
