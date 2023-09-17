import { initContract } from "@ts-rest/core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { string, z } from "zod";
import { categories } from "@/server/db/schema/categories";
import { items } from "@/server/db/schema/items";

const categorySchema = createSelectSchema(categories);

const categoryDetailsSchema = categorySchema.extend({
  items: z.object({ id: z.number(), name: z.string() }).array(),
});

const insertCategorySchema = categorySchema.omit({ id: true });

const c = initContract();

export const categoryContract = c.router({
  createCategory: {
    method: "POST",
    path: "/categories",
    responses: {
      201: categorySchema,
      400: z.object({ message: z.string() }),
    },
    body: insertCategorySchema,
    summary: "Create a category",
    metadata: { roles: ["user"] } as const,
  },
  updateCategory: {
    method: "PATCH",
    path: `/categories/:id`,
    responses: { 200: categorySchema, 404: z.object({ message: z.string() }) },
    body: insertCategorySchema,
    summary: "Update a category",
    metadata: {
      roles: ["user"],
      resource: "category",
      identifierPath: "params.id",
    } as const,
  },
  getCategory: {
    method: "GET",
    path: `/categories/:id`,
    responses: {
      200: categoryDetailsSchema,
      404: z.null(),
    },
    query: null,
    summary: "Get a category by id",
    metadata: { roles: ["user"] } as const,
  },
  getCategories: {
    method: "GET",
    path: "/categories",
    responses: {
      200: z.object({
        categories: categorySchema.array(),
        count: z.number(),
        limit: z.number(),
        offset: z.number(),
      }),
    },
    query: z.object({
      limit: z.string().transform(Number),
      offset: z.string().transform(Number),
    }),
  },
});
