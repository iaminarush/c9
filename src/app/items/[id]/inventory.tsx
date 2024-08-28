import CalculatorInput from "@/components/calculator-input";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import {
  createInventorySchema,
  inventorySchema,
} from "@/server/db/schema/inventory";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHomePlus, IconTrack, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useCreateInventory, useInventories } from "./query";
import toast from "react-hot-toast";
import { IconEdit } from "@tabler/icons-react";

export const AddInventoryComponent = ({ id }: { id: string }) => {
  const { data } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const createInventory = useCreateInventory();

  const onSubmit: SubmitHandler<AddFormSchema> = (data) => {
    const submitData = { ...data, quantity: `${data.quantity}` };
    console.log(submitData);

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

const addFormSchema = createInventorySchema;

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
  return (
    <Card p="xs">
      <Group justify="space-between">
        <Group>
          <Stack gap="xs">
            <Text fw={700}>Quantity</Text>
            <Text>{inventory.quantity}</Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={700}>Expiry</Text>
            <Text>{inventory.expiryDate}</Text>
          </Stack>
        </Group>

        <Group>
          <ActionIcon disabled>
            <IconEdit />
          </ActionIcon>

          <ActionIcon color="red" variant="filled" disabled>
            <IconTrash />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
};
