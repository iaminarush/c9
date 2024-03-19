import { client } from "@/contracts/contract";
import { storeContract } from "@/contracts/contract-store";
import { isNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponseBody, ServerInferResponses } from "@ts-rest/core";
import { produce } from "immer";

const keys = {
  all: ["store"],
  store: (id: string) => [...keys.all, id],
};

type StoresResponse = ServerInferResponses<typeof storeContract.getStores, 200>;

export type Store = ServerInferResponseBody<
  typeof storeContract.getStores,
  200
>[0];

export const useStores = () => client.stores.getStores.useQuery(keys.all);

export const useStore = (id: string) =>
  client.stores.getStore.useQuery(
    keys.store(id),
    { params: { id } },
    { enabled: isNumber(id) },
  );

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return client.stores.updateStore.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<StoresResponse>(keys.all, (oldData) => {
        if (!oldData) return undefined;

        const index = oldData.body.findIndex((s) => s.id === body.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft.body[index] = body;
          });

          return newData;
        }

        return oldData;
      });
    },
  });
};
