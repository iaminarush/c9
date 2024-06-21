"use client";

import { client } from "@/contracts/contract";
import { NestedCategories } from "@/server/db/schema";
import {
  Button,
  Skeleton,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  useComputedColorScheme,
} from "@mantine/core";
import clsx from "clsx";
import { produce } from "immer";
import { klona } from "klona";
import { useMemo, useState } from "react";
import {
  StaticTreeDataProvider,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useUpdateCategories } from "./query";
import { useSession } from "next-auth/react";

export default function Management() {
  return (
    <Tabs defaultValue="category">
      <TabsList mb="xs">
        <TabsTab value="category">Category</TabsTab>
        <TabsTab value="items">Items</TabsTab>
      </TabsList>

      <TabsPanel value="category">
        <CategoryManagement />
      </TabsPanel>

      <TabsPanel value="items">
        <ItemManagement />
      </TabsPanel>
    </Tabs>
  );
}

const CategoryManagement = () => {
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

  const flatCategories = client.categories.getAllCategories.useQuery(
    ["all categories"],
    {},
    {
      select: ({ body }) =>
        body.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId })),
    },
  );

  if (isLoading || flatCategories.isLoading) {
    return <Skeleton h={250} />;
  }

  if (isError || flatCategories.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <CategoryTree data={data} flatCategories={flatCategories.data} />
    </>
  );
};

const CategoryTree = ({
  data,
  flatCategories,
}: {
  data: Record<TreeItemIndex, TreeItem>;
  flatCategories: { id: number; name: string; parentId: number | null }[];
}) => {
  const [treeData, setTreeData] = useState(klona(flatCategories));
  const items = useMemo(() => klona(data), [data]);
  const { data: userData } = useSession();
  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(items, (item, data) => ({ ...item, data })),
    [items],
  );

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const { mutate, isLoading } = useUpdateCategories();

  const handleClick = () => {
    mutate({ body: treeData });
  };

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
            }
          }
        }}
      >
        <div className={clsx(computedColorScheme === "dark" && "rct-dark")}>
          <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
        </div>
      </UncontrolledTreeEnvironment>
      <Button
        onClick={handleClick}
        loading={isLoading}
        disabled={!userData?.user.admin}
      >
        Update
      </Button>
    </Stack>
  );
};

const ItemManagement = () => {
  return (
    <>
      <div>WIP</div>
    </>
  );
};
