"use client";
import { ActionIcon, Loader, rem } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";

import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGlobalSearch } from "./query";

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
            : "Type at least 3 letters to start searching"
        }
      />

      {/* <Spotlight.Root
        query={query}
        onQueryChange={setQuery}
        maxHeight={350}
        scrollable
      >
        <Spotlight.Search
          placeholder="Search"
          leftSection={
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          }
          rightSection={
            searchResults.isFetching ? <Loader size={rem(20)} /> : null
          }
        />
        <Spotlight.ActionsList>
          {query.length > 2 ? (
            !!searchResults.data &&
            !searchResults.data.categories.length &&
            !searchResults.data.items.length ? (
              <SpotlightEmpty>
                {"Couldn't find what you were looking for"}
              </SpotlightEmpty>
            ) : (
              <>
                <Spotlight.ActionsGroup label="Categories">
                  {searchResults.data?.categories.map((c) => (
                    <Spotlight.Action key={c.id} label={c.label}>
                      <Link href={`/categories/${c.id}`} />
                    </Spotlight.Action>
                  ))}
                </Spotlight.ActionsGroup>
                <Spotlight.ActionsGroup label="Items"></Spotlight.ActionsGroup>
              </>
            )
          ) : (
            <Spotlight.Empty>
              Type at least 3 letters to start searching
            </Spotlight.Empty>
          )}
        </Spotlight.ActionsList>
      </Spotlight.Root> */}
    </>
  );
}
