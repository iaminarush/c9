import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { barcodes } from "./barcodes";
import { categories } from "./categories";
import { records } from "./records";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  category: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.category],
    references: [categories.id],
  }),
  records: many(records),
  barcodes: many(barcodes),
}));

export const itemSchema = createSelectSchema(items);

export const createItemSchema = createInsertSchema(items);

export const updateItemSchema = createSelectSchema(items).partial();
