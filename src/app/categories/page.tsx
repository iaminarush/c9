"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { client } from "@/contracts/contract";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useCategories } from "./query";

export default function Home() {
  const categories = useCategories();

  if (categories.isLoading) {
    return <Skeleton h={250} />;
  }

  if (categories.isError) {
    return <div>Error</div>;
  }

  return (
    <Stack>
      <Group justify="flex-end">
        <AddCategory />
      </Group>

      {categories.data.body.categories.length === 0 && (
        <Text>No Categories</Text>
      )}
      {categories.data.body.categories.map((c) => (
        <Button href={`/categories/${c.id}`} component={Link} key={c.id}>
          {c.name}
        </Button>
      ))}
    </Stack>
  );
}

const AddCategory = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit } = useForm();

  return (
    <>
      <ActionIcon>
        <IconPlus />
      </ActionIcon>

      <Modal opened={opened} onClose={close} title="Create Item" centered>
        <Stack>
          <TextFormField
            label="Item Name"
            control={control}
            name="name"
            rules={{ required: "Required" }}
          />
          <Button
            onClick={() => void handleSubmit(onSubmit)()}
            loading={createItem.isLoading}
          >
            Create
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
