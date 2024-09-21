import { client } from "@/contracts/contract";
import { inventoryContract } from "@/contracts/contract-inventory";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { produce } from "immer";

const keys = {
  all: ["inventory"],
};

export const useAllInventory = () =>
  client.inventory.getAllInventory.useQuery(keys.all);

type InventoriesResponse = ServerInferResponses<
  typeof inventoryContract.getInventories,
  200
>;

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return client.inventory.deleteInventory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<InventoriesResponse>(keys.all, (oldData) => {
        console.log(oldData);
        if (!oldData) return undefined;

        const index = oldData.body.findIndex((i) => i.id === body.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft.body.splice(index, 1);
          });

          return newData;
        }

        return oldData;
      });
    },
  });
};

export const useEditInventory = () => {
  const queryClient = useQueryClient();

  return client.inventory.editInventory.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<InventoriesResponse>(keys.all, (oldData) => {
        if (!oldData) return undefined;

        const index = oldData.body.findIndex((i) => i.id === body.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft.body[index] = { ...draft.body[index]!, ...body };
          });

          return newData;
        }

        return oldData;
      });
    },
  });
};
