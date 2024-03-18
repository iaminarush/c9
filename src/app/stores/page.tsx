"use client";

import {
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { Store, useStores } from "./query";
import { IconPhotoOff } from "@tabler/icons-react";
import classes from "./Stores.module.css";
import Link from "next/link";

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
    <Card component={Link} href={`/stores/${store.id}`}>
      <Group>
        <IconPhotoOff />
        <Text>{store.name}</Text>
      </Group>
    </Card>
  );
};
