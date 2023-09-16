"use client";
import { client } from "@/contracts/contract";

const useCategories = () =>
  client.categories.getCategories.useQuery(["categories"], {
    query: { limit: "100", offset: "0" },
  });

export default function Home() {
  const categories = useCategories();

  if (categories.isLoading) {
    return <div>Loading...</div>;
  }

  if (categories.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <div>
        {categories.data.body.categories.map((c, i) => (
          <div key={i}>{c.name}</div>
        ))}
      </div>
    </>
  );
}
