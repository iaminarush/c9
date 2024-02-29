import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const actions = z.object({ id: z.number(), label: z.string() }).array();

export const searchContract = c.router({
  searchBoth: {
    method: "GET",
    path: "/globalSearch",
    responses: {
      200: z.object({
        categories: actions,
        items: actions,
      }),
    },
    query: z.object({ keyword: z.string() }),
    summary: "Get a list of categories and items",
  },
});
