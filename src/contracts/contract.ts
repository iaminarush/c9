import { initContract } from "@ts-rest/core";
import { initQueryClient } from "@ts-rest/react-query";
import { categoryContract } from "./contract-category";
import { itemContract } from "./contract-item";
import { recordContract } from "./contract-record";
import { storeContract } from "./contract-store";
import { unitFamiliesContract } from "./contract-unitFamily";
import { unitTypesContract } from "./contract-unitType";
import { searchContract } from "./contract-search";
import { barcodeContract } from "./contract-barcode";
import { inventoryContract } from "./contract-inventory";

const c = initContract();

export const contract = c.router(
  {
    categories: categoryContract,
    items: itemContract,
    records: recordContract,
    stores: storeContract,
    unitTypes: unitTypesContract,
    unitFamilies: unitFamiliesContract,
    search: searchContract,
    barcodes: barcodeContract,
    inventory: inventoryContract,
  },
  {
    strictStatusCodes: true,
  },
);

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "/api"; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}/api`; // dev SSR should use localhost
};

export const client = initQueryClient(contract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {},
});
