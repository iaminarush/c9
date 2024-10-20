"use client";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import {
  inventorySchema,
  updateInventorySchema,
} from "@/server/db/schema/inventory";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
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
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconEdit,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useAllInventory, useDeleteInventory, useEditInventory } from "./query";
import { useIsAdmin, useIsAuthenticated } from "@/util/hooks";
import Link from "next/link";
import { Route } from "next";

dayjs.extend(relativeTime);

export default function Inventory() {
  const isAuth = useIsAuthenticated();
  const inventory = useAllInventory(isAuth);
  const [filter, setFilter] = useState("");

  if (inventory.isLoading) {
    return <Skeleton h={250} />;
  }

  if (!isAuth) {
    return <Text>Please login</Text>;
  }

  if (inventory.isError) {
    return <Text>Error</Text>;
  }

  const filtered = inventory.data.body.filter(
    (i) => i.item.name.includes(filter) && !i.complete,
  );

  return (
    <Stack>
      <TextInput
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        leftSection={<IconSearch size={20} />}
        rightSection={
          filter && (
            <ActionIcon
              color="red"
              variant="filled"
              size={20}
              onClick={() => setFilter("")}
            >
              <IconX />
            </ActionIcon>
          )
        }
      />
      {filtered.map(({ item, ...inv }) => (
        <InventoryCard
          {...inv}
          item={
            <>
              <Anchor
                component={Link}
                href={`/items/${item.id}` as Route}
                fw={700}
                fz="lg"
              >
                {item.name}
              </Anchor>
            </>
          }
          key={inv.id}
        />
      ))}
    </Stack>
  );
}

type Inventory = z.infer<typeof inventorySchema>;

const InventoryCard = ({
  item,
  ...inventory
}: Inventory & { item?: ReactNode }) => {
  const [edit, { open, close }] = useDisclosure(false);
  const matches = useMediaQuery("(min-width: 36em)");
  const expiryDate = dayjs(inventory.expiryDate);
  const today = dayjs();
  const { data } = useSession();

  const timeLeft = expiryDate.isSame(today, "day")
    ? "Expiring today!"
    : expiryDate.isBefore(today, "day")
    ? "Expired :("
    : `Expiring ${expiryDate.fromNow()}`;

  const difference = expiryDate.diff(today, "day");

  return (
    <Card p="xs">
      {!edit ? (
        <Stack>
          {item}
          <Group justify="space-between" wrap="nowrap" gap={"xs"}>
            <Group align="flex-start">
              <Stack gap="xs">
                <Text fw={700}>{matches ? "Quantity" : "Qty"}</Text>
                <Text>{inventory.quantity}</Text>
              </Stack>

              <Stack gap="xs" justify="flex-start">
                <Text fw={700}>Expiry</Text>
                {inventory.expiryDate ? (
                  <>
                    <Text>
                      {dayjs(inventory.expiryDate).format("YYYY-MM-DD")}
                    </Text>
                    {difference <= 3 && difference >= 0 ? (
                      <Badge color="red">{timeLeft}</Badge>
                    ) : (
                      <Text>{timeLeft}</Text>
                    )}
                  </>
                ) : (
                  <Text>No expiry date</Text>
                )}
              </Stack>
            </Group>

            <Group>
              <Stack>
                <ActionIcon onClick={open} disabled={!data?.user.admin}>
                  <IconEdit />
                </ActionIcon>

                <DeleteComponent id={inventory.id} />

                <CompleteComponent id={inventory.id} />
              </Stack>
            </Group>
          </Group>
        </Stack>
      ) : (
        <EditForm {...inventory} close={close} item={item} />
      )}
    </Card>
  );
};

const CompleteComponent = ({ id }: { id: number }) => {
  const isAdmin = useIsAdmin();
  const [opened, setOpened] = useState(false);
  const { mutate, isLoading } = useEditInventory();

  const handleConfirm = () => {
    mutate(
      { body: { complete: true }, params: { id: `${id}` } },
      { onSuccess: () => setOpened(false) },
    );
  };

  return (
    <Popover opened={opened} withArrow onChange={setOpened}>
      <PopoverTarget>
        <ActionIcon disabled={!isAdmin} onClick={() => setOpened((o) => !o)}>
          <IconCheck />
        </ActionIcon>
      </PopoverTarget>

      <PopoverDropdown>
        <Button onClick={handleConfirm} loading={isLoading}>
          Confirm
        </Button>
      </PopoverDropdown>
    </Popover>
  );
};

const DeleteComponent = ({ id }: { id: number }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { data } = useSession();

  const { mutate, isLoading } = useDeleteInventory();

  const handleClick = () => {
    mutate(
      { params: { id: `${id}` }, body: null },
      { onSuccess: () => close() },
    );
  };

  return (
    <>
      <ActionIcon
        color="red"
        variant="filled"
        onClick={open}
        disabled={!data?.user.admin}
      >
        <IconTrash />
      </ActionIcon>

      <Modal opened={opened} onClose={close} title="Delete this item?" centered>
        <Stack>
          <Button
            color="red"
            variant="filled"
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

const editFormSchema = updateInventorySchema.merge(
  z.object({ expiryDate: z.date().nullable(), quantity: z.number() }),
);

type EditFormSchema = z.infer<typeof editFormSchema>;

const EditForm = ({
  close,
  item,
  ...inventory
}: Inventory & { close: () => void; item: ReactNode }) => {
  const { control, handleSubmit } = useForm<EditFormSchema>({
    defaultValues: {
      ...inventory,
      quantity: Number(inventory.quantity),
      expiryDate: inventory.expiryDate
        ? dayjs(inventory.expiryDate).toDate()
        : null,
    },
  });
  const { mutate, isLoading } = useEditInventory();

  const onSubmit: SubmitHandler<EditFormSchema> = (data) => {
    const submitData = {
      quantity: `${data.quantity}`,
      expiryDate: data.expiryDate ? data.expiryDate.toISOString() : null,
    };

    mutate(
      { body: submitData, params: { id: `${inventory.id}` } },
      { onSuccess: () => close() },
    );
  };

  return (
    <Stack>
      {item}
      <Group justify="space-between">
        <Group>
          <NumberFormField control={control} name="quantity" label="Quantity" />
          <DateFormField control={control} name="expiryDate" label="Expiry" />
        </Group>
        <Stack>
          <ActionIcon
            variant="filled"
            color="red"
            onClick={close}
            loading={isLoading}
          >
            <IconX />
          </ActionIcon>
          <ActionIcon
            variant="filled"
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
          >
            <IconCheck />
          </ActionIcon>
        </Stack>
      </Group>
    </Stack>
  );
};
