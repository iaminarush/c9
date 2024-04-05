import { client } from "@/contracts/contract";

const keys = {
  all: ["uncategorized-items"],
};

export const useUncategorizedItems = () =>
  client.items.getUncategorizedItems.useQuery(keys.all);
