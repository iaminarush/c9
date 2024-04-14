import { client } from "@/contracts/contract";
import { useQueryClient } from "@tanstack/react-query";

export const useNestedCategories = () => {
  return client.categories.getNestedCategoriesAndItems.useQuery([
    "nested categories",
  ]);
};

export const useUpdateCategories = () => {
  const queryClient = useQueryClient();

  return client.categories.updateAllCategories.useMutation({
    onSuccess: () => queryClient.invalidateQueries(["category"]),
  });
};
