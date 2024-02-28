import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const searchContract = c.router({
  searchBoth: {
    method: "GET",
    path: "/globalSearch",
    responses: {
      200: z.null(),
    },
    query: z.object({ keyword: z.string() }),
    summary: "Get a list of categories and items",
  },
});
