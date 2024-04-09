"use client";

import { CategoryTree } from "../categories/categoryTree";
import { useNestedCategories } from "./query";

export default function Management() {
  const query = useNestedCategories();
  return (
    <>
      <CategoryTree />
    </>
  );
}
