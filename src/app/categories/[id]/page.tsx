"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { isNumber } from "@/lib/utils";
import { createSubCategorySchema } from "@/server/db/schema";
import { createItemSchema } from "@/server/db/schema/items";
import { DisclosureHandlers } from "@/util/commonTypes";
import {
  ActionIcon,
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  ButtonProps,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconEdit,
  IconFolders,
  IconGripHorizontal,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ComponentPropsWithRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { z } from "zod";
import {
  useCategory,
  useCreateItem,
  useCreateSubCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "./query";
import { useRouter } from "next13-progressbar";
import { Route } from "next";
import { client } from "@/contracts/contract";

export default function Category({
  params: { id },
}: {
  params: { id: string };
}) {
  const category = useCategory(id, { enabled: isNumber(id) });
  // const [opened, { open, close, toggle }] = useDisclosure(false);
  const [popoverOpened, popoverHandlers] = useDisclosure(false);
  const [categoryOpened, categoryHandlers] = useDisclosure(false);
  const [itemOpened, itemHandlers] = useDisclosure(false);
  const session = useSession();

  if (!isNumber(id)) {
    return <Text>Category Id must be a number</Text>;
  }

  if (category.isLoading) {
    return <Skeleton h={250} />;
  }

  if (category.isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <Stack h="calc(100dvh - var(--app-shell-header-height, 0px) - var(--app-shell-padding) * 2 - var(--app-shell-footer-height, 0px))">
        <Group justify="space-between" gap="xs">
          <CategoryTitle id={id} />
          <Popover opened={popoverOpened} onClose={popoverHandlers.close}>
            <PopoverTarget>
              <ActionIcon
                onClick={popoverHandlers.open}
                disabled={!session.data?.user.admin}
              >
                <IconPlus />
              </ActionIcon>
            </PopoverTarget>

            <PopoverDropdown>
              <Stack gap="xs">
                <DropDownButton
                  onClick={() => {
                    popoverHandlers.close();
                    categoryHandlers.open();
                  }}
                >
                  Add Category
                </DropDownButton>
                <DropDownButton
                  onClick={() => {
                    popoverHandlers.close();
                    itemHandlers.open();
                  }}
                >
                  Add Item
                </DropDownButton>
              </Stack>
            </PopoverDropdown>
          </Popover>
        </Group>

        <PanelGroup
          direction="vertical"
          style={{
            height: "100%",
          }}
        >
          <Panel maxSize={75}>
            <Box style={{ height: "100%", overflow: "auto" }} py="xs">
              <Stack>
                {category.data.body.subCategories.length ? (
                  category.data.body.subCategories.map((sc) => (
                    <Button
                      renderRoot={(props) => (
                        <Link href={`/categories/${sc.id}`} {...props} />
                      )}
                      key={sc.id}
                    >
                      {sc.name}
                    </Button>
                  ))
                ) : (
                  <Text>No Categories</Text>
                )}
              </Stack>
            </Box>
          </Panel>
          <PanelResizeHandle>
            <Card p={0} withBorder>
              <Center>
                <IconGripHorizontal size={16} />
              </Center>
            </Card>
          </PanelResizeHandle>
          <Panel maxSize={75}>
            <Box style={{ height: "100%", overflow: "auto" }} py="xs">
              <Stack>
                {category.data.body.items.length ? (
                  category.data.body.items.map((item) => (
                    <Button
                      renderRoot={(props) => (
                        <Link href={`/items/${item.id}`} {...props} />
                      )}
                      key={item.id}
                    >
                      {item.name}
                    </Button>
                  ))
                ) : (
                  <Text>No Items </Text>
                )}
              </Stack>
            </Box>
          </Panel>
        </PanelGroup>
      </Stack>

      <CategoryModal
        opened={categoryOpened}
        handlers={categoryHandlers}
        id={id}
      />

      <ItemModal opened={itemOpened} handlers={itemHandlers} id={id} />
    </>
  );
}

const CategoryTitle = ({ id }: { id: string }) => {
  const [edit, handlers] = useDisclosure(false);
  const category = useCategory(id, { enabled: isNumber(id) });
  const parentCategory = useCategory(
    category.data?.body.parentId ? `${category.data.body.parentId}` : "",
    {
      enabled: !!category.data?.body.parentId,
    },
  );

  const [value, setValue] = useState(category.data?.body.name || "");
  const { mutate, isLoading } = useUpdateCategory();
  const { data } = useSession();

  const handleUpdate = () => {
    mutate(
      {
        body: { name: value },
        params: { id },
      },
      {
        onSuccess: () => {
          handlers.close();
        },
      },
    );
  };

  if (category.isLoading) return <Skeleton h={250} />;

  if (category.isError) return <Text>Error</Text>;

  if (!edit) console.log(category.data);
  return (
    <>
      {category.data.body.parentId ? (
        <Group>
          <Breadcrumbs>
            {parentCategory.isSuccess ? (
              <Anchor
                component={Link}
                href={`/categories/${category.data.body.parentId}` as Route}
              >
                {parentCategory.data?.body.name}
              </Anchor>
            ) : (
              <Skeleton w={48} h={16} />
            )}
            <Text fw={700}>{category.data.body.name}</Text>
          </Breadcrumbs>

          <ActionIcon disabled={!data?.user.admin} onClick={handlers.open}>
            <IconEdit />
          </ActionIcon>

          <DeleteComponent id={id} />

          <ManageCategory
            id={id}
            parentId={category.data.body.parentId || null}
          />
        </Group>
      ) : (
        <Group gap="xs">
          <Text>Category: {category.data.body.name}</Text>
          <ActionIcon disabled={!data?.user.admin} onClick={handlers.open}>
            <IconEdit />
          </ActionIcon>

          <DeleteComponent id={id} />

          <ManageCategory
            id={id}
            parentId={category.data.body.parentId || null}
          />
        </Group>
      )}
    </>
  );

  if (edit)
    return (
      <Group gap="xs">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          rightSection={
            <ActionIcon
              variant="transparent"
              color="red"
              onClick={handlers.close}
              disabled={isLoading}
            >
              <IconX />
            </ActionIcon>
          }
          disabled={isLoading}
        />
        <ActionIcon
          variant="transparent"
          color="green"
          onClick={handleUpdate}
          loading={isLoading}
        >
          <IconDeviceFloppy />
        </ActionIcon>
      </Group>
    );
};

const DeleteComponent = ({ id }: { id: string }) => {
  const [opened, handlers] = useDisclosure(false);
  const [value, setValue] = useState("");
  const { mutate, isLoading } = useDeleteCategory();
  const router = useRouter();
  const { data } = useSession();

  const handleClick = () => {
    mutate(
      { params: { id }, body: null },
      {
        onSuccess: ({ body }) => {
          router.push(
            body.parentId ? `/categories/${body.parentId}` : "/categories",
          );
          toast.success(`Category ${body.name} deleted`);
        },
      },
    );
  };

  return (
    <>
      <ActionIcon
        color="red"
        variant="filled"
        onClick={handlers.open}
        disabled={!data?.user.admin}
      >
        <IconTrash />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title="Delete this category?"
        centered
      >
        <Stack>
          <TextInput
            label="Please type delete to confirm"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          <Button
            color="red"
            variant="filled"
            disabled={value !== "delete"}
            onClick={handleClick}
            loading={isLoading}
          >
            Delete
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

const DropDownButton = ({
  children,
  ...rest
}: ButtonProps & ComponentPropsWithRef<"button">) => {
  return (
    <Button
      justify="space-between"
      fullWidth
      rightSection={<IconPlus size={14} />}
      leftSection={<span />}
      variant="default"
      {...rest}
    >
      {children}
    </Button>
  );
};

type CategoryFormData = z.infer<typeof createSubCategorySchema>;

const CategoryModal = ({
  opened,
  handlers,
  id,
}: {
  opened: boolean;
  handlers: DisclosureHandlers;
  id: string;
}) => {
  const { control, handleSubmit } = useForm<CategoryFormData>({
    defaultValues: { parentId: Number(id), name: "" },
  });
  const createSubCategory = useCreateSubCategory();
  const { data } = useSession();

  const onSubmit: SubmitHandler<CategoryFormData> = (data) => {
    const result = createSubCategorySchema.safeParse(data);
    if (result.success) {
      createSubCategory.mutate({ body: result.data });
    }
  };

  return (
    <Modal opened={opened} onClose={handlers.close} title="Add a Category">
      <Stack>
        <TextFormField
          label="Category"
          control={control}
          name="name"
          rules={{ required: "Required" }}
        />
        <Button
          onClick={() => void handleSubmit(onSubmit)()}
          loading={createSubCategory.isLoading}
          disabled={!data?.user.admin}
        >
          Create
        </Button>
      </Stack>
    </Modal>
  );
};

type ItemFormData = z.infer<typeof createItemSchema>;

const ItemModal = ({
  opened,
  handlers,
  id,
}: {
  opened: boolean;
  handlers: DisclosureHandlers;
  id: string;
}) => {
  const { control, handleSubmit } = useForm<ItemFormData>({
    defaultValues: { category: Number(id), name: "" },
  });
  const createItem = useCreateItem();

  const onSubmit: SubmitHandler<ItemFormData> = (data) => {
    const result = createItemSchema.safeParse(data);
    if (result.success) {
      createItem.mutate(
        { body: result.data },
        { onSuccess: () => handlers.close() },
      );
    }
  };

  return (
    <Modal opened={opened} onClose={handlers.close} title="Add Item" centered>
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
  );
};

const ManageCategory = ({
  parentId,
  id,
}: {
  parentId: number | null;
  id: string;
}) => {
  const [opened, handlers] = useDisclosure();
  const [value, setValue] = useState(parentId ? `${parentId}` : null);
  const { data, isFetching } = client.categories.getAllCategories.useQuery(
    ["all categories"],
    {},
    {
      enabled: opened,
      select: ({ body }) =>
        body.map((c) => ({ value: `${c.id}`, label: c.name })),
    },
  );
  const { mutate, isLoading } = useUpdateCategory();

  const handleUpdate = () =>
    mutate(
      {
        body: { parentId: value ? Number(value) : null },
        params: { id },
      },
      { onSuccess: () => handlers.close() },
    );

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconFolders />
      </ActionIcon>
      <Modal
        opened={opened}
        onClose={handlers.close}
        centered
        title="Move category"
      >
        <Stack>
          <Select
            data={data}
            onChange={setValue}
            value={value}
            rightSection={isFetching ? <Loader size={16} /> : null}
            searchable
          />

          <Button
            disabled={value === `${parentId}`}
            onClick={handleUpdate}
            loading={isLoading}
          >
            Update
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
