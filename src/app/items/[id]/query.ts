import { client } from "@/contracts/contract";
import { itemContract } from "@/contracts/contract-item";
import { UseQueryOptions } from "@ts-rest/react-query";

const keys = {
  all: ["item"],
  item: (id: string) => [...keys.all, id] as const,
};

export const useItem = (
  id: string,
  queryOptions?: UseQueryOptions<typeof itemContract.getItem>,
) =>
  client.items.getItem.useQuery(
    keys.item(id),
    { params: { id } },
    queryOptions,
  );
