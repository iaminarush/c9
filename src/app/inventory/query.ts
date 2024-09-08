import { client } from "@/contracts/contract";

const keys = {
  all: ["inventory"],
};

export const useAllInventory = () =>
  client.inventory.getAllInventory.useQuery(keys.all);
