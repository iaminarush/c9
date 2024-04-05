import { client } from "@/contracts/contract";
import { storeContract } from "@/contracts/contract-store";
import { unitFamiliesContract } from "@/contracts/contract-unitFamily";
import { unitTypesContract } from "@/contracts/contract-unitType";
import { UseQueryOptions } from "@ts-rest/react-query";

export const useStoresData = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<typeof storeContract.getStoresFormatted>;
}) => client.stores.getStoresFormatted.useQuery(["stores"], {}, queryOptions);

export const useUnitTypesData = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<
    typeof unitTypesContract.getUnitTypesFormatted
  >;
}) => client.unitTypes.getUnitTypesFormatted.useQuery([""], {}, queryOptions);

export const useUnitFamilies = ({
  queryOptions,
}: {
  queryOptions: UseQueryOptions<typeof unitFamiliesContract.getUnitFamilies>;
}) =>
  client.unitFamilies.getUnitFamilies.useQuery(
    ["unit families"],
    {},
    queryOptions,
  );

export const useUnitFamiliesData = ({
  queryOptions,
}: {
  queryOptions?: UseQueryOptions<
    typeof unitFamiliesContract.getUnitFamiliesFormatted
  >;
}) =>
  client.unitFamilies.getUnitFamiliesFormatted.useQuery(
    ["unit families"],
    {},
    queryOptions,
  );
