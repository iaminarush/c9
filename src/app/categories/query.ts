import { client } from "@/contracts/contract";
import { categoryContract } from "@/contracts/contract-category";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { produce } from "immer";

const keys = {
  all: ["categories"],
  formatted: ["categories", "formatted"],
};

export type CategoriesResponse = ServerInferResponses<
  typeof categoryContract.getCategories,
  200
>;

export const useCategories = () =>
  client.categories.getCategories.useQuery(keys.all, {
    query: { limit: 100, offset: 0 },
  });

export const useCategoriesFormatted = () =>
  client.categories.getCategoriesFormatted.useQuery(keys.formatted);

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return client.categories.createCategory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<CategoriesResponse>(keys.all, (oldData) => {
        if (!oldData) return undefined;

        const newData = produce(oldData, (draft) => {
          draft.body.categories.push(body);
        });
        return newData;
      });
    },
  });
};
