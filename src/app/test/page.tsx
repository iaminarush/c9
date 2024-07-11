"use client";

import { redirect } from "next/navigation";

export default function Test() {
  if (process.env.NODE_ENV === "production") {
    redirect("/categories");
  }

  return (
    <>
      <></>
    </>
  );
}
