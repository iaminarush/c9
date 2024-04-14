import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { itemSchema, items } from "./items";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    remark: text("remark"),
    updatedAt: timestamp("updated_at"),
    createdAt: timestamp("created_at").defaultNow(),
    parentId: integer("parent_id").references(
      (): AnyPgColumn => categories.id,
      { onDelete: "cascade" },
    ),
  },
  (t) => ({
    unq: unique().on(t.name, t.parentId),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const categorySchema = createSelectSchema(categories);

export const categoryDetailsSchema = categorySchema.extend({
  items: z.lazy(() => itemSchema.array()),
  subCategories: z.lazy(() => categorySchema.array()),
});

export const createCategorySchema = createInsertSchema(categories);

export const updateCategorySchema = createSelectSchema(categories).partial();

export const subCategorySchema = categorySchema.merge(
  z.object({ parentId: z.number() }),
);

export const createSubCategorySchema = createCategorySchema.merge(
  z.object({ parentId: z.number() }),
);

export const categoryWithItems = categorySchema.extend({
  items: z.lazy(() => itemSchema.array()),
});

export type NestedCategories = z.infer<typeof categorySchema> & {
  categories: NestedCategories[];
  items: z.infer<typeof itemSchema>[];
};

export const nestedCategoryWithItem: z.ZodType<NestedCategories> =
  categorySchema.extend({
    items: z.lazy(() => itemSchema.array()),
    categories: z.lazy(() => nestedCategoryWithItem.array()),
  });
