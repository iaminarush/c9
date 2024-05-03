"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { createCategorySchema } from "@/server/db/schema";
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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories, useCreateCategory } from "./query";

export default function Home() {
  const { isLoading, isError, data } = useCategories();

  if (isLoading) {
    return <Skeleton h={250} />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <Stack>
      <Group justify="flex-end">
        <AddCategory />
      </Group>

      {data.body.categories.length === 0 && <Text>No Categories</Text>}
      {data.body.categories.map((c) => (
        <Button
          renderRoot={(props) => (
            <Link href={`/categories/${c.id}`} {...props} />
          )}
          key={c.id}
        >
          {c.name}
        </Button>
      ))}
      <Button href={"/categories/uncategorized"} component={Link}>
        Uncategorized
      </Button>
    </Stack>
  );
}

type FormData = z.infer<typeof createCategorySchema>;

const AddCategory = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit } = useForm<FormData>();
  const createCategory = useCreateCategory();
  const { data } = useSession();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const result = createCategorySchema.safeParse(data);
    if (result.success) {
      createCategory.mutate(
        { body: result.data },
        { onSuccess: () => handlers.close() },
      );
    }
  };

  return (
    <>
      <ActionIcon onClick={handlers.open} disabled={!data?.user.admin}>
        <IconPlus />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title="Create Category"
        centered
      >
        <Stack>
          <TextFormField
            label="Category"
            control={control}
            name="name"
            rules={{ required: "Required" }}
          />
          <Button
            onClick={() => void handleSubmit(onSubmit)()}
            loading={createCategory.isLoading}
          >
            Create
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
