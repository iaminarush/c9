import { client } from "@/contracts/contract";
import { barcodeContract } from "@/contracts/contract-barcode";
import { inventoryContract } from "@/contracts/contract-inventory";
import { itemContract } from "@/contracts/contract-item";
import { recordContract } from "@/contracts/contract-record";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { UseQueryOptions } from "@ts-rest/react-query";
import { produce } from "immer";

const keys = {
  all: ["item"],
  item: (id: string) => [...keys.all, id] as const,
  record: (itemId: string) => ["record", itemId] as const,
  barcodes: (id: number) => [...keys.all, "barcodes", id],
  unitTypes: (id: number) => ["unit types by family", id],
  inventories: (id: string) => ["inventories", id],
};

type RecordsResponse = ServerInferResponses<
  typeof recordContract.getRecords,
  200
>;

type BarcodesResponse = ServerInferResponses<
  typeof barcodeContract.getAllBarcodesByItem,
  200
>;

type ItemResponse = ServerInferResponses<typeof itemContract.getItem, 200>;

export const useItem = (
  id: string,
  queryOptions?: UseQueryOptions<typeof itemContract.getItem>,
) =>
  client.items.getItem.useQuery(
    keys.item(id),
    { params: { id } },
    queryOptions,
  );

export const useRecords = (id: string) =>
  client.records.getRecords.useQuery(keys.record(id), {
    query: { item: Number(id) },
  });

export const useCreateRecord = (id: string) => {
  const queryClient = useQueryClient();

  return client.records.createRecord.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<RecordsResponse>(keys.record(id), (oldData) => {
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
  const queryClient = useQueryClient();

  return client.barcodes.createBarcode.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<BarcodesResponse>(
        keys.barcodes(body.itemId),
        (oldData) => {
          if (!oldData) return undefined;

          const newData = produce(oldData, (draft) => {
            draft.body.push(body);
          });

          return newData;
        },
      );
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return client.items.deleteItem.useMutation({
    onSuccess: ({ body }) => {
      queryClient.removeQueries(keys.item(`${body.id}`));
      queryClient.invalidateQueries(["category"]);
    },
  });
};

export const useBarcodes = (itemId: number) =>
  client.barcodes.getAllBarcodesByItem.useQuery(keys.barcodes(itemId), {
    query: { itemId },
  });

export const useDeleteBarcode = () => {
  const queryClient = useQueryClient();

  return client.barcodes.deleteBarcode.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<BarcodesResponse>(
        keys.barcodes(body.itemId),
        (oldData) => {
          if (!oldData) return undefined;

          const index = oldData.body.findIndex((b) => b.id === body.id);

          if (index !== -1) {
            const newData = produce(oldData, (draft) => {
              draft.body.splice(index, 1);
            });

            return newData;
          }

          return oldData;
        },
      );
    },
  });
};

export const useEditRecord = () => {
  const queryClient = useQueryClient();

  return client.records.editRecord.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<RecordsResponse>(
        keys.record(`${body.itemId}`),
        (oldData) => {
          if (!oldData) return undefined;

          const index = oldData.body.findIndex((r) => r.id === body.id);

          if (index !== -1) {
            const newData = produce(oldData, (draft) => {
              draft.body[index] = body;
            });

            return newData;
          }

          return oldData;
        },
      );
    },
  });
};

export const useDeleteRecord = (itemId: string) => {
  const queryClient = useQueryClient();

  return client.records.deleteRecord.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<RecordsResponse>(
        keys.record(itemId),
        (oldData) => {
          if (!oldData) return undefined;

          const index = oldData.body.findIndex((r) => r.id === body.id);

          if (index !== -1) {
            const newData = produce(oldData, (draft) => {
              draft.body.splice(index, 1);
            });

            return newData;
          }

          return oldData;
        },
      );
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return client.items.updateItem.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<ItemResponse>(
        keys.item(`${body.id}`),
        (oldData) => {
          if (!oldData) return undefined;

          const newData = produce(oldData, (draft) => {
            draft.body.name = body.name;
          });

          return newData;
        },
      );
    },
  });
};

export const useUnitTypesFromFamily = (id: number) =>
  client.unitTypes.getUnitTypesByFamily.useQuery(
    keys.unitTypes(id),
    {
      params: { id: `${id}` },
    },
    {
      select: ({ body }) =>
        body.map((b) => ({ value: `${b.id}`, label: b.name })),
    },
  );
  
type InventoriesResponse = ServerInferResponses<typeof inventoryContract.getInventories, 200>

export const useCreateInventory = () => {
  const queryClient = useQueryClient()

  return client.inventory.createInventory.useMutation({
    //TODO
    // onSuccess: ({body}) => {
    //   queryClient.setQueryData<InventoriesResponse>
    // }
  });
};

export const useInventories = (id: string) =>
  client.inventory.getInventories.useQuery(keys.inventories(id), {
    query: { item: Number(id) },
  });
