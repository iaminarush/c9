"use client";

import { useUncategorizedItems } from "./query";

export default function Uncategorized() {
  const uncategorizedItems = useUncategorizedItems();

  console.log(uncategorizedItems.data);

  return (
    <>
      <div>uncategorized</div>
    </>
  );
}
