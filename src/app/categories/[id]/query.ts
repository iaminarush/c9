import { client } from "@/contracts/contract";
import { categoryContract } from "@/contracts/contract-category";
import { categoryDetailsSchema } from "@/server/db/schema/categories";
import { useQueryClient } from "@tanstack/react-query";
import { UseQueryOptions } from "@ts-rest/react-query";
import { produce } from "immer";
import { z } from "zod";

const keys = {
  all: ["categories"],
  category: (id: string) => [...keys.all, id] as const,
};

export const useCategory = (
  id: string,
  queryOptions?: UseQueryOptions<typeof categoryContract.getCategory>,
) =>
  client.categories.getCategory.useQuery(
    keys.category(id),
    {
      params: { id },
    },
    queryOptions,
  );

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return client.items.createItem.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<z.infer<typeof categoryDetailsSchema>>(
        keys.category(`${body.category}`),
        (oldData) => {
          if (!oldData) return undefined;
          const newData = produce(oldData, (draft) => {
            draft.items.push(body);
          });
          return newData;
        },
      );
    },
  });
};
