"use client";

import { Skeleton, Stack, Text, Title } from "@mantine/core";
import { useItem } from "./query";

export default function Item({ params: { id } }: { params: { id: string } }) {
  const { isLoading, isError, data } = useItem(id);

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  return (
    <>
      <Stack>
        <Title>{data.body.name}</Title>
      </Stack>
    </>
  );
}
