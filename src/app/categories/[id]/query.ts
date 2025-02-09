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

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();

  return client.categories.createSubCategory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<CategoryResponse>(
        keys.category(`${body.parentId}`),
        (oldData) => {
          if (!oldData) return undefined;

          const newData = produce(oldData, (draft) => {
            draft.body.subCategories.push(body);
          });
          return newData;
        },
      );
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return client.categories.updateCategory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<CategoryResponse>(
        keys.category(`${body.id}`),
        (oldData) => {
          if (!oldData) return undefined;

          const newData = produce(oldData, (draft) => {
            draft.body.name = body.name;
            draft.body.parentId = body.parentId;
          });

          return newData;
        },
      );

      queryClient.setQueryData<CategoryResponse>(
        keys.category(`${body.parentId}`),
        (oldData) => {
          if (!oldData) return undefined;

          const index = oldData.body.subCategories.findIndex(
            (c) => c.id === body.id,
          );

          if (index === -1) return oldData;

          const newData = produce(oldData, (draft) => {
            draft.body.subCategories[index] = body;
          });

          return newData;
        },
      );
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return client.categories.deleteCategory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.removeQueries(keys.category(`${body.id}`));
      queryClient.invalidateQueries(keys.all);
    },
  });
};
