import { client } from "@/contracts/contract";
import { categoryContract } from "@/contracts/contract-category";
import { UseQueryOptions } from "@ts-rest/react-query";

const keys = {
  all: ["categories"],
  category: (id: string) => [...keys.all, id] as const,
};

export const useCategory = (
  id: string,
  queryOptions?: UseQueryOptions<typeof categoryContract.getCategory>
) =>
  client.categories.getCategory.useQuery(
    keys.category(id),
    {
      params: { id },
    },
    queryOptions
  );

export const useCreateItem = () => client.items.createItem.useMutation();
