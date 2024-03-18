import { client } from "@/contracts/contract";
import { ServerInferResponses } from "@ts-rest/core";
import { storeContract } from "@/contracts/contract-store";
import { z } from "zod";
import { storeSchema } from "@/server/db/schema";

const keys = {
  all: ["stores"],
};

export type Store = z.infer<typeof storeSchema>;

export const useStores = () => client.stores.getStores.useQuery(keys.all);
