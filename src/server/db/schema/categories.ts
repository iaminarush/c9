import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  integer,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { itemSchema, items } from "./items";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const categorySchema = createSelectSchema(categories);

export const categoryDetailsSchema = categorySchema.extend({
  items: z.lazy(() => itemSchema.array()),
});
