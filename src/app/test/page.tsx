"use client";

import { redirect } from "next/navigation";
import Barcode from "react-barcode";

export default function Test() {
  if (process.env.NODE_ENV === "production") {
    redirect("/categories");
  }

  return (
    <>
      <Barcode value={"49567779"} height={75} width={1.5} format="EAN8" />
    </>
  );
}
