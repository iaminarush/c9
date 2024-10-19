"use client";

import CalculatorInput from "@/components/calculator-input";
import DateFormField from "@/components/hook-form/DateFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import { createInventorySchema } from "@/server/db/schema";
import { useIsAuthenticated } from "@/util/hooks";
import { Button, Stack } from "@mantine/core";
import { ReactNode } from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateInventory } from "../query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const addFormSchema = createInventorySchema.merge(
  z.object({ expiryDate: z.date() }),
);

type AddFormSchema = z.infer<typeof addFormSchema>;

export default function AddInventory({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const isAuthed = useIsAuthenticated();

  const form = useForm<AddFormSchema>({
    defaultValues: { itemId: Number(id) },
  });

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
          router.back();
        },
        onError: () => toast.error("Error"),
      },
    );
  };

  return (
    <>
      <FormLayout
        form={form}
        submitButton={
          <Button
            onClick={form.handleSubmit(onSubmit)}
            loading={createInventory.isLoading}
            disabled={!isAuthed}
          >
            Add Inventory
          </Button>
        }
      />
    </>
  );
}

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
          <CalculatorInput
            //@ts-expect-error Mantine types doesn't pass additional object propertis to item
            onEnter={(value) => setValue("quantity", roundTo(value))}
          />
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
        inputMode="none"
      />

      {submitButton}
    </Stack>
  );
};
