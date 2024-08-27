import CalculatorInput from "@/components/calculator-input";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import { createInventorySchema } from "@/server/db/schema/inventory";
import { ActionIcon, Button, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHomePlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useCreateInventory } from "./query";
import toast from "react-hot-toast";

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
        prefix="$"
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
