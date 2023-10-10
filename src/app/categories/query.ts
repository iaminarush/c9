import { client } from "@/contracts/contract";
import { categoryContract } from "@/contracts/contract-category";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";

const keys = {
  all: ["categories"],
};

export const useCategories = () =>
  client.categories.getCategories.useQuery(keys.all, {
    query: { limit: "100", offset: "0" },
  });

type CategoryResponse = ServerInferResponses<
  typeof categoryContract.createCategory,
  201
>;

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return client.categories.createCategory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<CategoryResponse>();
    },
  });
};
