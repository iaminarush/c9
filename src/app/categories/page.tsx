"use client";

import "react-complex-tree/lib/style-modern.css";
import TextFormField from "@/components/hook-form/TextFormField";
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
import { SubmitHandler, useForm } from "react-hook-form";
import { useCategories, useCreateCategory } from "./query";
import { createCategorySchema } from "@/server/db/schema";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { CategoryTree } from "./categoryTree";

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
      {/* {categories.data.body.categories.map((c) => (
        <Button href={`/categories/${c.id}`} component={Link} key={c.id}>
          {c.name}
        </Button>
      ))}
      <Button href={"/categories/uncategorized"} component={Link}>
        Uncategorized
      </Button> */}

      {!!data.body.categories.length && <CategoryTree categories={data.body.categories} />}
    </Stack>
  );
}

type FormData = z.infer<typeof createCategorySchema>;

const AddCategory = () => {
  const [opened, handlers] = useDisclosure(false);
  const { control, handleSubmit } = useForm<FormData>();
  const createCategory = useCreateCategory();
  const session = useSession();

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
      <ActionIcon onClick={handlers.open} disabled={!session.data?.user.admin}>
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
