"use client";

import { Button, Skeleton, Stack } from "@mantine/core";
import { useUncategorizedItems } from "./query";
import Link from "next/link";

export default function Uncategorized() {
  const uncategorizedItems = useUncategorizedItems();

  if (uncategorizedItems.isLoading) {
    return <Skeleton h={250} />;
  }

  if (uncategorizedItems.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <Stack>
        {uncategorizedItems.data?.body.map((i) => (
          <Button key={i.id} component={Link} href={`/items/${i.id}`}>
            {i.name}
          </Button>
        ))}
      </Stack>
    </>
  );
}
