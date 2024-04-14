import { contract } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { db } from "@/server/db/db";
import {
  NestedCategories,
  categories,
  categoryWithItems,
} from "@/server/db/schema/categories";
import { createNextRoute } from "@ts-rest/next";
import { eq, isNull, sql } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

export const categoriesRouter = createNextRoute(contract.categories, {
  createCategory: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newCategory] = await db
      .insert(categories)
      .values(args.body)
      .returning();

    return newCategory
      ? { status: 201, body: newCategory }
      : { status: 400, body: { message: "Error" } };
  },
  updateCategory: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    if (isNumber(args.params.id)) {
      const [updatedCategory] = await db
        .update(categories)
        .set(args.body)
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

      const subCategories = await db.query.categories.findMany({
        where: eq(categories.parentId, Number(args.params.id)),
      });

      if (category) {
        return { status: 200, body: { ...category, subCategories } };
      } else return { status: 404, body: null };
    }

    return { status: 404, body: null };
  },
  getCategories: async (args) => {
    const _categories = await db
      .select()
      .from(categories)
      .where(isNull(categories.parentId))
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
  createSubCategory: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const [newCategory] = await db
      .insert(categories)
      .values(args.body)
      .returning();

    return newCategory
      ? { status: 201, body: newCategory }
      : { status: 400, body: { message: "Error" } };
  },
  deleteCategory: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 404, body: { message: "No Permission" } };

    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, Number(args.params.id)))
      .returning();

    return deletedCategory
      ? { status: 200, body: deletedCategory }
      : { status: 404, body: { message: "Error" } };
  },
  getAllCategories: async () => {
    const categories = await db.query.categories.findMany({
      // with: {
      //   items: true,
      // },
    });

    return categories
      ? { status: 200, body: categories }
      : { status: 404, body: { message: "Error" } };
  },
  getNestedCategoriesAndItems: async () => {
    const categories = await db.query.categories.findMany({
      with: {
        items: true,
      },
    });

    const recursiveNest = (
      data: z.infer<typeof categoryWithItems>[],
      parentId: number | null = null,
    ) => {
      return data.reduce((r, e) => {
        if (parentId === e.parentId) {
          const object: NestedCategories = { ...e, categories: [] };
          const categories = recursiveNest(data, e.id);

          if (categories.length) {
            object.categories = categories;
          } else {
            object.categories = [];
          }
          r.push(object);
        }
        return r;
      }, [] as NestedCategories[]);
    };

    const nestedCategories = (() => recursiveNest(categories))();

    return nestedCategories
      ? { status: 200, body: nestedCategories }
      : { status: 404, body: { message: "Error" } };
  },
  updateAllCategories: async (args) => {
    const token = await getToken({ req: args.req });

    if (!token?.admin)
      return { status: 403, body: { message: "No Permission" } };

    const result = await db
      .insert(categories)
      .values(args.body)
      .onConflictDoUpdate({
        target: categories.id,
        set: { parentId: sql.raw(`excluded.${categories.parentId.name}`) },
      })
      .returning();

    return result
      ? { status: 201, body: result }
      : { status: 400, body: { message: "Error" } };
  },
});
