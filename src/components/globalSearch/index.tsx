"use client";
import { ActionIcon, Loader, rem } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";

import { useDebouncedValue } from "@mantine/hooks";
import { useState } from "react";
import { useGlobalSearch } from "./query";
import { useRouter } from "next13-progressbar";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 250);
  const searchResults = useGlobalSearch(debounced, router);

  return (
    <>
      <ActionIcon size="lg" onClick={spotlight.open}>
        <IconSearch />
      </ActionIcon>

      <Spotlight
        actions={searchResults.data || []}
        highlightQuery
        scrollable
        maxHeight={350}
        query={query}
        onQueryChange={setQuery}
        searchProps={{
          leftSection: (
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          rightSection: searchResults.isFetching ? (
            <Loader size={rem(20)} />
          ) : null,
          placeholder: "Search",
        }}
        nothingFound={
          searchResults.data
            ? "Couldn't find what you were looking for"
            : "Type something to start searching"
        }
      />
    </>
  );
}
