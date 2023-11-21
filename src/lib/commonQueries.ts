import { client } from "@/contracts/contract";
import { storeContract } from "@/contracts/contract-store";
import { UseQueryOptions } from "@ts-rest/react-query";

export const useStoresData = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<typeof storeContract.getStores>;
}) =>
  client.stores.getStores.useQuery(
    ["stores"],
    {},
    {
      //@ts-expect-error ts-rest bug
      select: (data) =>
        data.body.map((d) => ({ label: d.name, value: `${d.id}` })),
      ...queryOptions,
    },
  );

export const useUnitTypesData = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<typeof storeContract.getStores>;
}) =>
  client.unitTypes.getUnitTypes.useQuery(
    ["unit types"],
    {},
    {
      //@ts-expect-error ts-rest bug
      select: (data) =>
        data.body.map((d) => ({ label: d.name, value: `${d.id}` })),
      ...queryOptions,
    },
  );
