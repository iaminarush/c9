import { client } from "@/contracts/contract";
import { ActionIcon } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export default function GlobalSearch() {
  const kek = client.search.searchBoth.useQuery(["global-search"], {
    query: { keyword: "to" },
  });

  return (
    <>
      <ActionIcon size="lg">
        <IconSearch />
      </ActionIcon>
    </>
  );
}
