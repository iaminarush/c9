import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { records } from "./records";

export const barcodes = pgTable("barcodes", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 13 }),
  recordId: integer("record_id"),
});

export const barcodesRelations = relations(barcodes, ({ one }) => ({
  record: one(records, {
    fields: [barcodes.id],
    references: [records.id],
  }),
}));
