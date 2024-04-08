"use client";

import { categorySchema } from "@/server/db/schema";
import { StaticTreeDataProvider, Tree, TreeItem, UncontrolledTreeEnvironment } from "react-complex-tree";
import { z } from "zod";

type Category = z.infer<typeof categorySchema>;

const items = {
  root: {
    index: 'root',
    canMove: true,
    isFolder: true,
    children: ['child1', 'child2'],
    data: 'Root item',
    canRename: true,
  },
  child1: {
    index: 'child1',
    canMove: true,
    isFolder: false,
    children: [],
    data: 'Child item 1',
    canRename: true,
  },
  child2: {
    index: 'child2',
    canMove: true,
    isFolder: false,
    children: [],
    data: 'Child item 2',
    canRename: true,
  },
};

export const CategoryTree = ({ categories }: { categories: Category[] }) => {
  
  // const treeData: TreeItem[] = categories.map(c => ({
  //   data: c.name
  // }))

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
      >
        <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </>
  );
};
