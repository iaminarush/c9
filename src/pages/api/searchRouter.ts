import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { categories, items } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { ilike } from "drizzle-orm";

export const searchRouter = createNextRoute(contract.search, {
  searchBoth: async (args) => {
    const _categories = await db
      .select({
        id: categories.id,
        label: categories.name,
      })
      .from(categories)
      .where(ilike(categories.name, `%${args.query.keyword}%`));

    const _items = await db
      .select({
        id: items.id,
        label: items.name,
      })
      .from(items)
      .where(ilike(items.name, `%${args.query.keyword}%`));

    return {
      status: 200,
      body: {
        categories: _categories,
        items: _items,
      },
    };
  },
});
