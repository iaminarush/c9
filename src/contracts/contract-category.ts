import {
  categoryDetailsSchema,
  categorySchema,
  createCategorySchema,
  createSubCategorySchema,
  subCategorySchema,
  updateCategorySchema,
} from "@/server/db/schema/categories";
import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const categoryContract = c.router({
  createCategory: {
    method: "POST",
    path: "/categories",
    responses: {
      201: categorySchema,
      400: z.object({ message: z.string() }),
    },
    body: createCategorySchema,
    summary: "Create a category",
  },
  updateCategory: {
    method: "PATCH",
    path: `/categories/:id`,
    responses: {
      200: categorySchema,
      404: z.object({ message: z.string() }),
    },
    body: updateCategorySchema,
    summary: "Update a category",
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
      404: z.null(),
    },
    query: z.object({
      limit: z.number(),
      offset: z.number(),
    }),
  },
  createSubCategory: {
    method: "POST",
    path: "/subCategories",
    responses: {
      201: categorySchema,
      400: z.object({ message: z.string() }),
    },
    body: createSubCategorySchema,
    summary: "Create a Sub Category",
  },
});
