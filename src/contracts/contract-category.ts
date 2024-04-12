import {
  categoryDetailsSchema,
  categorySchema,
  categoryWithItems,
  createCategorySchema,
  createSubCategorySchema,
  nestedCategoryWithItem,
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
      403: z.object({ message: z.string() }),
    },
    body: createCategorySchema,
    summary: "Create a category",
  },
  updateCategory: {
    method: "PATCH",
    path: `/categories/:id`,
    responses: {
      200: categorySchema,
      403: z.object({ message: z.string() }),
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
      403: z.object({ message: z.string() }),
    },
    body: createSubCategorySchema,
    summary: "Create a Sub Category",
  },
  deleteCategory: {
    method: "DELETE",
    path: "/categories/:id",
    body: z.any(),
    responses: { 200: categorySchema, 404: z.object({ message: z.string() }) },
    summary: "Delete a category",
  },
  getAllCategories: {
    method: "GET",
    path: "/all-categories",
    responses: {
      200: categorySchema.array(),
      404: z.object({ message: z.string() }),
    },
    summary: "Get nested list of categories and items",
  },
  getNestedCategoriesAndItems: {
    method: "GET",
    path: "/nested-categories-items",
    responses: {
      200: nestedCategoryWithItem.array(),
      404: z.object({ message: z.string() }),
    },
    summary: "Get all categories",
  },
  // updateAllCategories: {
  //   method: 'POST',
  //   path: "/all-categories",
  //   responses: {

  //   }
  // }
});
