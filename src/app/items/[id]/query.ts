import { client } from "@/contracts/contract";
import { itemContract } from "@/contracts/contract-item";
import { recordContract } from "@/contracts/contract-record";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { UseQueryOptions } from "@ts-rest/react-query";
import { produce } from "immer";

const keys = {
  all: ["item"],
  item: (id: string) => [...keys.all, id] as const,
  record: (id: string) => ["record", id],
};

type RecordsResponse = ServerInferResponses<
  typeof recordContract.getRecords,
  200
>;

export const useItem = (
  id: string,
  queryOptions?: UseQueryOptions<typeof itemContract.getItem>,
) =>
  client.items.getItem.useQuery(
    keys.item(id),
    { params: { id } },
    queryOptions,
  );

export const useCreateRecord = (id: string) => {
  const queryClient = useQueryClient();

  return client.records.createRecord.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<RecordsResponse>(keys.record(id), (oldData) => {
        console.log(oldData, id, keys.record(id));
        if (!oldData) return undefined;

        const newData = produce(oldData, (draft) => {
          draft.body.push(body);
        });
        return newData;
      });
    },
  });
};

export const useCreateBarcode = () => {
  return client.barcodes.createBarcode.useMutation();
};
