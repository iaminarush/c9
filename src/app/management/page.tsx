"use client";

import "react-complex-tree/lib/style-modern.css";
import { Skeleton, useComputedColorScheme } from "@mantine/core";
import {
  ControlledTreeEnvironment,
  DraggingPositionBetweenItems,
  DraggingPositionItem,
  StaticTreeDataProvider,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import clsx from "clsx";
import { client } from "@/contracts/contract";
import { NestedCategories, recordsRelations } from "@/server/db/schema";
import { useState } from "react";
import { produce } from "immer";

export default function Management() {
  const { isLoading, isError, data } =
    client.categories.getNestedCategoriesAndItems.useQuery(
      ["nested categories"],
      {},
      {
        cacheTime: 0,
        select: ({ body }) => {
          const items: Record<TreeItemIndex, TreeItem> = {
            root: {
              index: "root",
              data: "Root Item",
              children: body
                .filter((c) => c.parentId === null)
                .map((c) => c.id),
              canMove: true,
              isFolder: true,
            },
          };

          const recursiveAdd = (data: NestedCategories[]) => {
            data.forEach((c) => {
              items[c.id] = {
                index: c.id,
                data: c.name,
                children: c.categories.length
                  ? c.categories.map((s) => s.id)
                  : undefined,
                isFolder: true,
                canMove: true,
              };
              if (c.categories.length) {
                recursiveAdd(c.categories);
              }
            });
          };

          recursiveAdd(body);

          return items;
        },
      },
    );

  if (isLoading) {
    return <Skeleton h={250} />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <CategoryTree data={data} />
    </>
  );
}
// const items = {
//   root: {
//     index: "root",
//     isFolder: true,
//     children: ["child1", "child2"],
//     data: "Root item",
//   },
//   child1: {
//     index: "child1",
//     children: [],
//     data: "Child item 1",
//   },
//   child2: {
//     index: "child2",
//     isFolder: true,
//     children: ["child3"],
//     data: "Child item 2",
//   },
//   child3: {
//     index: "child3",
//     children: [],
//     data: "Child item 3",
//   },
// };

const CategoryTree = ({ data }: { data: Record<TreeItemIndex, TreeItem> }) => {
  const [treeData, setTreeData] = useState({ ...data });

  console.log(treeData);

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(data, (item, data) => ({
          ...item,
          data,
        }))
      }
      getItemTitle={(item) => item.data}
      viewState={{}}
      canDragAndDrop={true}
      canReorderItems={true}
      canDropOnFolder={true}
      // disableMultiselect={true}
      onDrop={(items, t) => {
        // const newTreeData = produce(treeData, draft => {
        //   t.
        // })
        if (t.targetType !== "root") {
          console.log(items, t);
          const newTreeData = produce(treeData, (draft) => {
            // items.forEach(i => {
            //   draft[i.index]
            // })
            const arrayTreeData = [];

            for (const property in treeData) {
              arrayTreeData.push(treeData[property]);
            }

            console.log(arrayTreeData);
            const draggedIds = items.map((i) => i.index);
          });
        }
      }}
    >
      <div className={clsx(computedColorScheme === "dark" && "rct-dark")}>
        <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
      </div>
    </UncontrolledTreeEnvironment>
  );
};
