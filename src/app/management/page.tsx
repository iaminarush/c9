"use client";

import { Skeleton, useComputedColorScheme } from "@mantine/core";
import { CategoryTree } from "../categories/categoryTree";
import { useNestedCategories } from "./query";
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import clsx from "clsx";
import { client } from "@/contracts/contract";

export default function Management() {
  // const { isLoading, isError, data } =
  //   client.categories.getNestedCategoriesAndItems.useQuery(
  //     ["nested categories"],
  //     {},
  //     {
  //       // select: (data) => ({
  //       //   root: {
  //       //     index: "root",
  //       //     canMove: true,
  //       //     isFolder: true,
  //       //     children: data.body.map((c) => c.id),
  //       //     data: "Root tem",
  //       //   },
  //       // }),
  //     },
  //   );

  const { isLoading, isError, data } = client.categories.getCategories.useQuery(
    ["categories"],
    { query: { limit: Infinity, offset: 0 } },
  );

  console.log(data);

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  if (isLoading) {
    return <Skeleton h={250} />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      {/* <UncontrolledTreeEnvironment
        dataProvider={
          new StaticTreeDataProvider(data, (item, data) => ({
            ...item,
            data,
          }))
        }
        getItemTitle={(item) => item.data}
        viewState={{}}
        onSelectItems={(i) => console.log(i)}
        canDragAndDrop={true}
        canReorderItems={true}
        canDropOnFolder={true}
      >
        <div className={clsx(computedColorScheme === "dark" && "rct-dark")}>
          <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
        </div>
      </UncontrolledTreeEnvironment> */}
    </>
  );
}
