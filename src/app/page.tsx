"use client";
import { Text } from "@mantine/core";
import { client } from "@/contracts/contract";

const useCategories = () =>
  client.categories.getCategories.useQuery(["categories"], {
    query: { limit: "100", offset: "0" },
  });

const useCategory = () =>
  client.categories.getCategory.useQuery(["category"], { params: { id: "2" } });

export default function Home() {
  // const categories = useCategories();

  // if (categories.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (categories.isError) {
  //   return <div>Error</div>;
  // }

  return (
    <>
      <div>
        {/* {categories.data.body.categories.map((c, i) => (
          <div key={i}>{c.name}</div>
        ))} */}
        {/* {Array(31)
          .fill("test")
          .map((a, i) => (
            <div key={i}>{a}</div>
          ))} */}
      </div>
    </>
  );
}
