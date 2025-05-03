import { contract } from "@/contracts/contract";
import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { NextApiRequest, NextApiResponse } from "next";
import { categoryRouter } from "./category-router";
import { itemRouter } from "./item-router";
import { recordRouter } from "./record-router";
import { storeRouter } from "./store-router";
import { unitTypeRouter } from "./unit-type-router";
import { unitFamilyRouter } from "./unit-family-router";
import { searchRouter } from "./search-router";
import { barcodeRouter } from "./barcode-router";
import { inventoryRouter } from "./inventory-router";
import { qrcodeRouter } from "./qrcodes-router";

const router = createNextRoute(contract, {
  categories: categoryRouter,
  items: itemRouter,
  records: recordRouter,
  stores: storeRouter,
  unitTypes: unitTypeRouter,
  unitFamilies: unitFamilyRouter,
  search: searchRouter,
  barcodes: barcodeRouter,
  inventory: inventoryRouter,
  qrcodes: qrcodeRouter,
});

export default createNextRouter(contract, router, {
  responseValidation: true,
  errorHandler: (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
    return res.status(500).json({ message: JSON.stringify(error) });
    // if (error instanceof ResponseValidationError) {
    //   return res.status(500).json({ message: "Internal Server Error" });
    // }
  },
  jsonQuery: true,
});
