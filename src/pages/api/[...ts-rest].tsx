import { contract } from "@/contracts/contract";
import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { NextApiRequest, NextApiResponse } from "next";
import { categoriesRouter } from "./categoriesRouter";
import { itemsRouter } from "./itemsRouter";
import { recordsRouter } from "./recordsRouter";
import { storesRouter } from "./storesRouter";

const router = createNextRoute(contract, {
  categories: categoriesRouter,
  items: itemsRouter,
  records: recordsRouter,
  stores: storesRouter,
});

export default createNextRouter(contract, router, {
  responseValidation: true,
  errorHandler: (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
    return res.status(500).json({ message: JSON.stringify(error) });
    // console.log(typeof error, error);
    // if (error instanceof ResponseValidationError) {
    //   return res.status(500).json({ message: "Internal Server Error" });
    // }
  },
  jsonQuery: true,
});
