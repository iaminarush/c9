import { client } from "@/contracts/contract";
import { storeContract } from "@/contracts/contract-store";
import { isNumber } from "@/lib/utils";
import { ServerInferResponseBody } from "@ts-rest/core";

const keys = {
  all: ["store"],
  store: (id: string) => [...keys.all, id],
};

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
