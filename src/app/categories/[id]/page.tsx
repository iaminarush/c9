"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { isNumber } from "@/lib/utils";
import { createItemSchema } from "@/server/db/schema/items";
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
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCategory, useCreateItem } from "./query";
import Link from "next/link";

type FormData = z.infer<typeof createItemSchema>;

export default function Category({
  params: { id },
}: {
  params: { id: string };
}) {
  const category = useCategory(id, { enabled: isNumber(id) });
  const createItem = useCreateItem();
  const [opened, { open, close }] = useDisclosure(false);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { category: Number(id), name: "" },
  });

  if (!isNumber(id)) {
    return <Text>Category Id must be a number</Text>;
  }

  if (category.isLoading) {
    return <Skeleton h={250} />;
  }

  if (category.isError) {
    return <div>Error</div>;
  }

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const result = createItemSchema.safeParse(data);
    if (result.success) {
      createItem.mutate({ body: result.data }, { onSuccess: () => close() });
    }
  };

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Text>Category: {category.data.body.name}</Text>
          <ActionIcon onClick={open}>
            <IconPlus />
          </ActionIcon>
        </Group>
        {category.data.body.items.map((i) => (
          <Button key={i.id} component={Link} href={`/items/${i.id}`}>
            {i.name}
          </Button>
        ))}
      </Stack>

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
}
