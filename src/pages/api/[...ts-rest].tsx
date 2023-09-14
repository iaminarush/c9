import { ResponseValidationError } from "@ts-rest/core";
import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { categories } from "@/server/db/schema/categories";

const categoriesRouter = createNextRoute(contract.categories, {
  createCategory: async (args) => {
    const [newCategory] = await db
      .insert(categories)
      .values(args.body)
      .returning();

    return newCategory
      ? { status: 201, body: newCategory }
      : { status: 400, body: { message: "Error" } };
  },
  updateCategory: async (args) => {
    if (isNumber(args.params.id)) {
      const [updatedCategory] = await db
        .update(categories)
        .set({ name: args.body.name })
        .where(eq(categories.id, Number(args.params.id)))
        .returning();

      if (updatedCategory) {
        return { status: 200, body: updatedCategory };
      }
    }

    return { status: 404, body: { message: "Category not found" } };
  },
  getCategory: async (args) => {
    if (isNumber(args.params.id)) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, Number(args.params.id)));

      if (category) {
        return { status: 200, body: category };
      }
    }

    return { status: 404, body: null };
  },
  getCategories: async (args) => {
    const _categories = await db
      .select()
      .from(categories)
      .limit(args.query.limit)
      .offset(args.query.offset);

    return {
      status: 200,
      body: {
        categories: _categories,
        count: _categories.length,
        limit: args.query.limit,
        offset: args.query.offset,
      },
    };
  },
});

const router = createNextRoute(contract, {
  categories: categoriesRouter,
});

export default createNextRouter(contract, router, {
  responseValidation: true,
  errorHandler: (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (error instanceof ResponseValidationError) {
      console.log(error.cause);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
});
