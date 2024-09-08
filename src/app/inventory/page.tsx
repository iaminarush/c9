"use client";
import { Skeleton, Stack, Text } from "@mantine/core";
import { InventoryCard } from "../items/[id]/inventory";
import { useAllInventory } from "./query";

export default function Inventory() {
  const inventory = useAllInventory();

  if (inventory.isLoading) {
    return <Skeleton h={250} />;
  }

  if (inventory.isError) {
    return <Text>Error</Text>;
  }

  return (
    <Stack>
      {inventory.data.body.map(({ item, ...inv }) => (
        <InventoryCard
          {...inv}
          item={
            <>
              <Text fw={700} fz="lg">
                {item.name}
              </Text>
            </>
          }
          key={inv.id}
        />
      ))}
    </Stack>
  );
}
