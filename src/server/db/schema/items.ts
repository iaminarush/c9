import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { categories } from "./categories";
import { prices } from "./prices";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
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
}));

export const itemSchema = createSelectSchema(items);

export const createItemSchema = createInsertSchema(items);
