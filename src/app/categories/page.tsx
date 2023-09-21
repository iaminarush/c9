"use client";

import { client } from "@/contracts/contract";
import { ActionIcon, Button, Group, Skeleton, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";

const useCategories = () =>
  client.categories.getCategories.useQuery(["categories"], {
    query: { limit: "100", offset: "0" },
  });

export default function Home() {
  const categories = useCategories();

  if (categories.isLoading) {
    return <Skeleton h={250} />;
  }

  if (categories.isError) {
    return <div>Error</div>;
  }

  return (
    <Stack>
      <Group justify="flex-end">
        <ActionIcon>
          <IconPlus />
        </ActionIcon>
      </Group>
      {categories.data.body.categories.map((c) => (
        <Button href={`/categories/${c.id}`} component={Link} key={c.id}>
          {c.name}
        </Button>
      ))}
    </Stack>
  );
}
