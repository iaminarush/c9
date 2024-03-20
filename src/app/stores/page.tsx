"use client";

import { Button, Image, Skeleton, Stack, Text } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";
import Link from "next/link";
import { Store, useStores } from "./query";

export default function Stores() {
  const stores = useStores();

  if (stores.isLoading) {
    return <Skeleton h={250} />;
  }

  if (stores.isError) {
    return <Text>Error</Text>;
  }

  return (
    <Stack>
      {stores.data.body.map((s) => (
        <StoreLink key={s.id} store={s} />
      ))}
    </Stack>
  );
}

const StoreLink = ({ store }: { store: Store }) => {
  return (
    <Button
      component={Link}
      href={`/stores/${store.id}`}
      size="xl"
      justify="space-between"
      leftSection={
        store.image ? (
          <Image src={store.image} alt="Logo" h={48} w={48} fit="contain" />
        ) : (
          <IconPhotoOff />
        )
      }
      rightSection={<span />}
    >
      {store.name}
    </Button>
  );
};
