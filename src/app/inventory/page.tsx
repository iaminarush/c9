"use client";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import {
  inventorySchema,
  updateInventorySchema,
} from "@/server/db/schema/inventory";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconEdit, IconTrash, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAllInventory, useDeleteInventory, useEditInventory } from "./query";

dayjs.extend(relativeTime);

export default function Inventory() {
  const inventory = useAllInventory();

  if (inventory.isLoading) {
    return <Skeleton h={250} />;
  }

  if (inventory.isError) {
    return <Text>Error</Text>;
  }

  return (
    <Stack>
      {inventory.data.body.map(({ item, ...inv }) => (
        <InventoryCard
          {...inv}
          item={
            <>
              <Text fw={700} fz="lg">
                {item.name}
              </Text>
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
                <Text>{dayjs(inventory.expiryDate).format("YYYY-MM-DD")}</Text>
                {difference <= 3 && difference >= 0 ? (
                  <Badge color="red">{timeLeft}</Badge>
                ) : (
                  <Text>{timeLeft}</Text>
                )}
              </Stack>
            </Group>

            <Group>
              <Stack>
                <ActionIcon onClick={open} disabled={!data?.user.admin}>
                  <IconEdit />
                </ActionIcon>

                <DeleteComponent id={inventory.id} />
              </Stack>
            </Group>
          </Group>
        </Stack>
      ) : (
        <EditForm {...inventory} close={close} />
      )}
    </Card>
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
  z.object({ expiryDate: z.date(), quantity: z.number() }),
);

type EditFormSchema = z.infer<typeof editFormSchema>;

const EditForm = ({
  close,
  ...inventory
}: Inventory & { close: () => void }) => {
  const { control, handleSubmit } = useForm<EditFormSchema>({
    defaultValues: {
      ...inventory,
      quantity: Number(inventory.quantity),
      expiryDate: dayjs(inventory.expiryDate).toDate(),
    },
  });
  const { mutate, isLoading } = useEditInventory();

  const onSubmit: SubmitHandler<EditFormSchema> = (data) => {
    const submitData = {
      quantity: `${data.quantity}`,
      expiryDate: data.expiryDate.toISOString(),
    };

    mutate(
      { body: submitData, params: { id: `${inventory.id}` } },
      { onSuccess: () => close() },
    );
  };

  const watch = useWatch({ control, name: "quantity" });
  console.log(watch);

  return (
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
  );
};
