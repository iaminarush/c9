import { contract } from "@/contracts/contract";
import { db } from "@/server/db/db";
import { categories } from "@/server/db/schema";
import { createNextRoute } from "@ts-rest/next";
import { ilike } from "drizzle-orm";

export const searchRouter = createNextRoute(contract.search, {
  searchBoth: async (args) => {
    const _categories = await db
      .select()
      .from(categories)
      .where(ilike(categories.name, `%${args.query.keyword}%`));

    console.log(_categories);

    return { status: 200, body: null };
  },
});
