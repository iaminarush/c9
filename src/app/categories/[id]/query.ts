import { client } from "@/contracts/contract";
import { categoryContract } from "@/contracts/contract-category";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { UseQueryOptions } from "@ts-rest/react-query";
import { produce } from "immer";

const keys = {
  all: ["category"],
  category: (id: string) => [...keys.all, id] as const,
};

type CategoryResponse = ServerInferResponses<
  typeof categoryContract.getCategory,
  200
>;

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
      queryClient.setQueryData<CategoryResponse>(
        keys.category(`${body.category}`),
        (oldData) => {
          console.log(oldData);

          if (!oldData) return undefined;
          const newData = produce(oldData, (draft) => {
            draft.body.items.push(body);
          });
          return newData;
        },
      );
    },
  });
};