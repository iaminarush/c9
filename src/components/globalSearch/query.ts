import { client } from "@/contracts/contract";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMemo } from "react";

export const useGlobalSearch = (keyword: string, router: AppRouterInstance) => {
  const query = client.search.searchBoth.useQuery(
    ["global search", keyword],
    {
      query: { keyword },
    },
    {
      enabled: keyword.length > 2,
      staleTime: 30000,
    },
  );

  return {
    ...query,
    data: useMemo(() => {
      if (query.data) {
        const categories = query.data.body.categories.map((c) => {
          router.prefetch(`/categories/${c.id}`);

          return {
            ...c,
            id: `${c.id}`,
            onClick: () => router.push(`/categories/${c.id}`),
          };
        });
        const items = query.data?.body.items.map((i) => {
          router.prefetch(`/items/${i.id}`);
          return {
            ...i,
            id: `${i.id}`,
            onClick: () => router.push(`/items/${i.id}`),
          };
        });
        return [
          {
            group: "Categories",
            actions: categories,
          },
          { group: "Items", actions: items },
        ];
        // return { categories, items };
      } else return null;
    }, [query.data]),
  };
};
