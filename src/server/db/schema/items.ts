import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { categories } from "./categories";
import { prices } from "./prices";
import { records } from "./records";
import { barcodes } from "./barcodes";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  remark: text("remark"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  category: integer("category_id")
    .references(() => categories.id)
    .notNull(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.category],
    references: [categories.id],
  }),
  prices: many(prices),
  records: many(records),
  barcodes: many(barcodes),
}));

export const itemSchema = createSelectSchema(items);

export const createItemSchema = createInsertSchema(items);
