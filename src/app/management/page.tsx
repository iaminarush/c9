"use client";

import "react-complex-tree/lib/style-modern.css";
import { Button, Skeleton, Stack, useComputedColorScheme } from "@mantine/core";
import {
  StaticTreeDataProvider,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import clsx from "clsx";
import { client } from "@/contracts/contract";
import {
  NestedCategories,
  categorySchema,
  recordsRelations,
} from "@/server/db/schema";
import { useMemo, useState } from "react";
import { produce } from "immer";
import { klona } from "klona";
import { z } from "zod";

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

  const flatCategories = client.categories.getAllCategories.useQuery([
    "categories",
  ]);

  if (isLoading || flatCategories.isLoading) {
    return <Skeleton h={250} />;
  }

  if (isError || flatCategories.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <CategoryTree data={data} flatCategories={flatCategories.data.body} />
    </>
  );
}

const CategoryTree = ({
  data,
  flatCategories,
}: {
  data: Record<TreeItemIndex, TreeItem>;
  flatCategories: z.infer<typeof categorySchema>[];
}) => {
  const [treeData, setTreeData] = useState(klona(flatCategories));
  const items = useMemo(() => klona(data), []);
  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(items, (item, data) => ({ ...item, data })),
    [items],
  );

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <Stack>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={(item) => item.data}
        viewState={{}}
        canDragAndDrop={true}
        canReorderItems={true}
        canDropOnFolder={true}
        disableMultiselect={true}
        onDrop={(items, t) => {
          const movedCategory = treeData.find((c) => c.id === items[0]?.index);

          if (movedCategory) {
            if (t.targetType !== "root") {
              console.log("non root", items, t, movedCategory);
              const newTreeData = produce(treeData, (draft) => {
                if (t.targetType === "between-items") {
                  const target = draft.find((c) => c.id === items[0]?.index);
                  if (target) {
                    if (t.parentItem !== "root") {
                      target.parentId = t.parentItem as number;
                    } else {
                      target.parentId = null;
                    }
                  }
                } else if (t.targetType === "item") {
                  const target = draft.find((c) => c.id === items[0]?.index);
                  if (target) {
                    target.parentId = t.targetItem as number;
                  }
                }
                return draft;
              });
              setTreeData(newTreeData);
            } else {
              console.log("root", items, t);
            }
          }
        }}
      >
        <div className={clsx(computedColorScheme === "dark" && "rct-dark")}>
          <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
        </div>
      </UncontrolledTreeEnvironment>
      <Button onClick={() => console.log(treeData)}>Update</Button>
    </Stack>
  );
};
