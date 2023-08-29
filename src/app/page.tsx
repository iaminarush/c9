"use client";
import { Text } from "@mantine/core";
import { client } from "~/contracts/contract";

const useCategories = () =>
  client.categories.getCategories.useQuery(["categories"], {
    query: { limit: "100", offset: "0" },
  });

const useCategory = () =>
  client.categories.getCategory.useQuery(["category"], { params: { id: "2" } });

export default function Home() {
  const category = useCategory();

  if (category.isLoading) {
    return <div>Loading...</div>;
  }

  if (category.isError) {
    return <div>Error</div>;
  }

  return (
    <div>{category.data.body.name}</div>
    // <div>
    //   {categories.data.body.categories.map((cat) => (
    //     <p key={cat.id}>{cat.name}</p>
    //   ))}
    // </div>
  );
}
