import { relations } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { prices } from "./prices";
import { createSelectSchema } from "drizzle-zod";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.id],
    references: [categories.id],
  }),
  prices: many(prices),
}));

export const itemSchema = createSelectSchema(items);
