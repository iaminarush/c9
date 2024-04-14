"use client";

import "react-complex-tree/lib/style-modern.css";
import { categorySchema } from "@/server/db/schema";
import { useComputedColorScheme } from "@mantine/core";
import clsx from "clsx";
import {
  StaticTreeDataProvider,
  Tree,
  TreeItem,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import { z } from "zod";

type Category = z.infer<typeof categorySchema>;

const items = {
  root: {
    index: "root",
    canMove: true,
    isFolder: true,
    children: ["child1", "child2"],
    data: "Root item",
    canRename: true,
  },
  child1: {
    index: "child1",
    canMove: true,
    isFolder: false,
    children: [],
    data: "Child item 1",
    canRename: true,
  },
  child2: {
    index: "child2",
    canMove: true,
    isFolder: false,
    children: [],
    data: "Child item 2",
    canRename: true,
  },
};

export const CategoryTree = () => {
  // const treeData: TreeItem[] = categories.map(c => ({
  //   data: c.name
  // }))
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <>
      <UncontrolledTreeEnvironment
        dataProvider={
          new StaticTreeDataProvider(items, (item, data) => ({
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
      </UncontrolledTreeEnvironment>
    </>
  );
};
