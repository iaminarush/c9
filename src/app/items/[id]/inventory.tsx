import CalculatorInput from "@/components/calculator-input";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import {
  createInventorySchema,
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
import {
  IconCheck,
  IconEdit,
  IconHomePlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import {
  SubmitHandler,
  UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  useCreateInventory,
  useDeleteInventory,
  useEditInventory,
  useInventories,
} from "./query";

dayjs.extend(relativeTime);

export const AddInventoryComponent = ({ id }: { id: string }) => {
  const { data } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const createInventory = useCreateInventory(id);

  const onSubmit: SubmitHandler<AddFormSchema> = (data) => {
    const submitData = {
      ...data,
      quantity: `${data.quantity}`,
      expiryDate: data.expiryDate.toISOString(),
    };

    createInventory.mutate(
      { body: submitData },
      {
        onSuccess: () => {
          close(), form.reset({ itemId: Number(id) });
        },
        onError: () => toast.error("Error"),
      },
    );
  };

  const form = useForm<AddFormSchema>({
    defaultValues: { itemId: Number(id) },
  });

  return (
    <>
      <ActionIcon disabled={!data?.user.admin} onClick={open}>
        <IconHomePlus />
      </ActionIcon>

      <Modal opened={opened} onClose={close} title="Add inventory" centered>
        <FormLayout
          form={form}
          submitButton={
            <Button
              onClick={form.handleSubmit(onSubmit)}
              loading={createInventory.isLoading}
            >
              Add Inventory
            </Button>
          }
        />
      </Modal>
    </>
  );
};

const addFormSchema = createInventorySchema.merge(
  z.object({ expiryDate: z.date() }),
);

type AddFormSchema = z.infer<typeof addFormSchema>;

const FormLayout = ({
  form,
  submitButton,
}: {
  form: UseFormReturn<AddFormSchema>;
  submitButton: ReactNode;
}) => {
  const { control, setValue } = form;

  return (
    <Stack>
      <NumberFormField
        control={control}
        name="quantity"
        rules={{ required: "Required" }}
        label="Quantity"
        withAsterisk
        min={0}
        decimalScale={2}
        thousandSeparator=","
        rightSection={
          //eslint-disable-next-line
          //@ts-expect-error Mantine types doesn't pass additional object propertis to item
          <CalculatorInput onEnter={(value) => setValue("quantity", value)} />
        }
        rightSectionWidth={36}
      />

      <DateFormField
        control={control}
        name="expiryDate"
        rules={{ required: "Required" }}
        label="Expiry Date"
        withAsterisk
        defaultLevel="year"
      />

      {submitButton}
    </Stack>
  );
};

export const InventoryPanel = ({ id }: { id: string }) => {
  const inventories = useInventories(id);

  if (inventories.isLoading) return <Skeleton />;

  if (inventories.isError) return <Text>Error</Text>;

  if (inventories.data.body.length === 0) {
    return <Text>{"No inventory :("}</Text>;
  }

  return (
    <Stack>
      {inventories.data.body.map((i) => (
        <InventoryCard key={i.id} {...i} />
      ))}
    </Stack>
  );
};

type Inventory = z.infer<typeof inventorySchema>;

const InventoryCard = (inventory: Inventory) => {
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
        <Group justify="space-between" wrap="nowrap" gap={"xs"}>
          <Group>
            <Stack gap="xs">
              <Text fw={700}>{matches ? "Quantity" : "Qty"}</Text>
              <Text>{inventory.quantity}</Text>
            </Stack>

            <Stack gap="xs">
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
