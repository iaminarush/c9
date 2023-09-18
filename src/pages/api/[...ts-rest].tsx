import { contract } from "@/contracts/contract";
import { ResponseValidationError } from "@ts-rest/core";
import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { NextApiRequest, NextApiResponse } from "next";
import { categoriesRouter } from "./categoriesRouter";
import { itemsRouter } from "./itemsRouter";

const router = createNextRoute(contract, {
  categories: categoriesRouter,
  items: itemsRouter,
});

export default createNextRouter(contract, router, {
  responseValidation: true,
  errorHandler: (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
    if (error instanceof ResponseValidationError) {
      console.log(error.cause);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
});
