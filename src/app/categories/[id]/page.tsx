"use client";

import TextFormField from "@/components/hook-form/TextFormField";
import { isNumber } from "@/lib/utils";
import { createSubCategorySchema } from "@/server/db/schema";
import { createItemSchema } from "@/server/db/schema/items";
import { DisclosureHandlers } from "@/util/commonTypes";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  ActionIcon,
  Button,
  ButtonProps,
  Group,
  Modal,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ComponentPropsWithRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  useCategory,
  useCreateItem,
  useCreateSubCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "./query";
import { useRouter } from "next/navigation";

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
      <Stack>
        <Group justify="space-between">
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

        <Accordion>
          <AccordionItem value="categories">
            <AccordionControl>Categories</AccordionControl>
            <AccordionPanel>
              <Stack mt="11">
                {category.data.body.subCategories.length ? (
                  category.data.body.subCategories.map((sc, i) => (
                    <Button
                      key={i}
                      component={Link}
                      href={`/categories/${sc.id}`}
                    >
                      {sc.name}
                    </Button>
                  ))
                ) : (
                  <Text>No Categories</Text>
                )}
              </Stack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem value="items">
            <AccordionControl>Items</AccordionControl>
            <AccordionPanel>
              <Stack mt="11">
                {category.data.body.items.length ? (
                  category.data.body.items.map((item, i) => (
                    <Button key={i} component={Link} href={`/items/${item.id}`}>
                      {item.name}
                    </Button>
                  ))
                ) : (
                  <Text>No Items </Text>
                )}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
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
  const [value, setValue] = useState(category.data?.body.name || "");
  const { mutate, isLoading } = useUpdateCategory();

  //TODO
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

  if (!edit)
    return (
      <>
        <Group gap="xs">
          <Text>Category: {category.data?.body.name}</Text>
          <ActionIcon disabled={!category.isSuccess} onClick={handlers.open}>
            <IconEdit />
          </ActionIcon>

          <DeleteModal id={id} />
        </Group>
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

const DeleteModal = ({ id }: { id: string }) => {
  const [opened, handlers] = useDisclosure(false);
  const [value, setValue] = useState("");
  const { mutate, isLoading } = useDeleteCategory();
  const router = useRouter();

  const handleClick = () => {
    mutate(
      { params: { id }, body: null },
      { onSuccess: () => router.push("/categories") },
    );
  };

  return (
    <>
      <ActionIcon color="red" variant="filled" onClick={handlers.open}>
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
