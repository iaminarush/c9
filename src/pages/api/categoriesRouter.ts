import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import { categories } from "@/server/db/schema/categories";
import { createNextRoute } from "@ts-rest/next";
import { eq } from "drizzle-orm";

export const categoriesRouter = createNextRoute(contract.categories, {
  createCategory: async (args) => {
    const [newCategory] = await db
      .insert(categories)
      .values(args.body)
      .onConflictDoNothing()
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
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, Number(args.params.id)),
        with: {
          items: true,
        },
      });

      if (category) {
        return { status: 200, body: category };
      } else return { status: 404, body: null };
    }

    return { status: 404, body: null };
  },
  getCategories: async (args) => {
    const _categories = await db
      .select()
      .from(categories)
      .limit(args.query.limit)
      .offset(args.query.offset);

    if (_categories) {
      return {
        status: 200,
        body: {
          categories: _categories,
          count: _categories.length,
          limit: args.query.limit,
          offset: args.query.offset,
        },
      };
    } else return { status: 404, body: null };
  },
});
