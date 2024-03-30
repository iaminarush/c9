import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { items } from "./items";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 13 }).notNull(),
  itemId: integer("item_id").notNull(),
});

export const barcodesRelations = relations(barcodes, ({ one }) => ({
  item: one(items, {
    fields: [barcodes.id],
    references: [items.id],
  }),
}));

export const barcodeSchema = createSelectSchema(barcodes);

export const createBarcodeSchema = createInsertSchema(barcodes);
