import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { items } from "./items";

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 13 }),
  itemId: integer("item_id"),
});

export const barcodesRelations = relations(barcodes, ({ one }) => ({
  item: one(items, {
    fields: [barcodes.id],
    references: [items.id],
  }),
}));
