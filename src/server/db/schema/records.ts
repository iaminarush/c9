import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";
import { units } from "./units";
import { items } from "./items";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  price: decimal("price").notNull(),
  description: text("description"),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  itemId: integer("item_id").notNull(),
  storeId: integer("store_id").notNull(),
  unitId: integer("unit_id"),
});

export const recordsRelations = relations(records, ({ one }) => ({
  unit: one(units, {
    fields: [records.unitId],
    references: [units.id],
  }),
  store: one(stores, {
    fields: [records.storeId],
    references: [stores.id],
  }),
  item: one(items, {
    fields: [records.itemId],
    references: [items.id],
  }),
}));

export const recordSchema = createSelectSchema(records);

export const createRecordSchema = createInsertSchema(records);
