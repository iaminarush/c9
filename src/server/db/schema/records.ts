import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { items } from "./items";
import { stores } from "./stores";
import { unitTypes } from "./unitTypes";

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  price: decimal("price").notNull(),
  description: text("description"),
  amount: decimal("amount").notNull(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  itemId: integer("item_id").notNull(),
  storeId: integer("store_id").notNull(),
  unitTypeId: integer("unit_type_id").notNull(),
  customUnit: text("custom_unit"),
});

export const recordsRelations = relations(records, ({ one }) => ({
  unitType: one(unitTypes, {
    fields: [records.unitTypeId],
    references: [unitTypes.id],
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
