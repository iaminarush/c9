import { client } from "@/contracts/contract";

export const useNestedCategories = () => {
  return client.categories.getNestedCategoriesAndItems.useQuery([
    "nested categories",
  ]);
};
