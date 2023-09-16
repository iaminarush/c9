"use client";
import { client } from "@/contracts/contract";
import { Stack, Text } from "@mantine/core";

const useCategory = (id: string) =>
  client.categories.getCategory.useQuery(["categories", id], {
    params: { id },
  });

export default function Category({ params }: { params: { id: string } }) {
  const category = useCategory(params.id);

  if (category.isLoading) {
    return <div>Loading...</div>;
  }

  if (category.isError) {
    return <div>Error</div>;
  }

  return (
    <Stack>
      <Text>Category Name {category.data.body.name}</Text>
      <Text>Category Id {category.data.body.id}</Text>
    </Stack>
  );
}
