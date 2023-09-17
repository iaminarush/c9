"use client";
import { client } from "@/contracts/contract";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

const useCategory = (id: string) =>
  client.categories.getCategory.useQuery(["categories", id], {
    params: { id },
  });

export default function Category({ params }: { params: { id: string } }) {
  const category = useCategory(params.id);
  const [opened, { open, close }] = useDisclosure(false);

  if (category.isLoading) {
    return <div>Loading...</div>;
  }

  if (category.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text>Category Name: {category.data.body.name}</Text>
          <ActionIcon onClick={open}>
            <IconPlus />
          </ActionIcon>
        </Group>
      </Stack>

      <Modal opened={opened} onClose={close} title="Create Item">
        <Stack>
          <TextInput label="Name" />
          <Button>Create</Button>
        </Stack>
      </Modal>
    </>
  );
}
