import { useDisclosure } from "@mantine/hooks";
import { Record } from "./page";
import {
  ActionIcon,
  Button,
  ComboboxLikeRenderOptionInput,
  Group,
  Image,
  Modal,
  Stack,
  Switch,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconEdit,
  IconPhotoOff,
  IconTrash,
} from "@tabler/icons-react";
import { useDeleteRecord, useEditRecord } from "./query";
import { toast } from "react-hot-toast";
import {
  SubmitHandler,
  UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import { createRecordSchema } from "@/server/db/schema";
import { z } from "zod";
import { ReactNode, useEffect } from "react";
import { useStoresData, useUnitTypesData } from "@/lib/commonQueries";
import SelectFormField from "@/components/hook-form/SelectFormField";
import NumberFormField from "@/components/hook-form/NumberFormField";
import CalculatorInput from "@/components/calculator-input";
import TextFormField from "@/components/hook-form/TextFormField";
import NextImage from "next/image";
import { roundTo } from "@/lib/utils";

export const EditRecordComponent = ({ record }: { record: Record }) => {
  const [opened, handlers] = useDisclosure(false);

  return (
    <>
      <Tooltip label="Edit Record">
        <ActionIcon onClick={handlers.open}>
          <IconEdit />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={handlers.close} title="Edit Record">
        {!!opened && <EditForm record={record} handleClose={handlers.close} />}
      </Modal>
    </>
  );
};

export const DeleteRecordComponent = ({
  itemId,
  recordId,
}: {
  itemId: number;
  recordId: number;
}) => {
  const [opened, handlers] = useDisclosure(false);
  const { mutate, isLoading } = useDeleteRecord(`${itemId}`);

  const handleClick = () => {
    mutate(
      { params: { id: `${recordId}` }, body: null },
      {
        onSuccess: () => {
          handlers.close();
          toast.success("Record deleted", { icon: <IconTrash /> });
        },
      },
    );
  };

  return (
    <>
      <Tooltip label="Delete Record">
        <ActionIcon color="red" variant="filled" onClick={handlers.open}>
          <IconTrash />
        </ActionIcon>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={handlers.close}
        centered
        title="Do you want to delete this record"
      >
        <Stack>
          <Button
            variant="filled"
            color="red"
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

const formSchema = createRecordSchema
  .merge(
    z.object({
      storeId: z.string(),
      unitTypeId: z.string().nullable(),
      price: z.number(),
      amount: z.number(),
      customUnit: z.string().nullable(),
    }),
  )
  .refine((val) => !!val.unitTypeId || !!val.customUnit, {
    message: "Either unit type or custom unit must be valie",
  });

type FormData = z.infer<typeof createRecordSchema>;

type FormSchema = z.infer<typeof formSchema>;

const EditForm = ({
  record,
  handleClose,
}: {
  record: Record;
  handleClose: () => void;
}) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      storeId: `${record.storeId}`,
      price: Number(record.price),
      unitTypeId: record.unitTypeId ? `${record.unitTypeId}` : null,
      amount: Number(record.amount),
      itemId: record.itemId,
      customUnit: record.customUnit,
      description: record.description,
    },
  });

  const { mutate, isLoading } = useEditRecord();

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    const submitData: FormData = {
      ...data,
      storeId: Number(data.storeId),
      unitTypeId: data.unitTypeId ? Number(data.unitTypeId) : null,
      price: `${data.price}`,
      amount: `${data.amount}`,
    };

    const result = createRecordSchema.safeParse(submitData);
    if (result.success) {
      mutate(
        { body: result.data, params: { id: `${record.id}` } },
        {
          onSuccess: () => {
            handleClose();
            toast.success("Record Updated");
          },
        },
      );
    } else {
      toast.error("Error occured when creating");
    }
  };

  return (
    <FormLayout
      form={form}
      enableQueries={true}
      submitButton={
        <Button loading={isLoading} onClick={form.handleSubmit(onSubmit)}>
          Update record
        </Button>
      }
    />
  );
};

export const FormLayout = ({
  form,
  enableQueries,
  submitButton,
  create,
}: {
  form: UseFormReturn<FormSchema>;
  enableQueries: boolean;
  submitButton: ReactNode;
  create?: boolean;
}) => {
  const { control, setValue } = form;
  const customUnit = useWatch({ control, name: "customUnit" });

  const customUnitEnabled = typeof customUnit === "string";

  const unitTypes = useUnitTypesData({
    queryOptions: { enabled: enableQueries },
  });
  const stores = useStoresData({ queryOptions: { enabled: enableQueries } });

  const watch = useWatch({ control, name: "price" });
  console.log(watch);

  useEffect(() => {
    if (unitTypes.isSuccess && create && !customUnitEnabled) {
      const gram = unitTypes.data.body.find((ut) => ut.label === "g");
      if (gram) form.setValue("unitTypeId", gram.value);
    }
  }, [unitTypes.isSuccess, customUnitEnabled]);

  return (
    <Stack>
      <SelectFormField
        control={control}
        name="storeId"
        data={stores.data?.body}
        loading={stores.isLoading}
        label="Store"
        rules={{ required: "Required" }}
        searchable
        withAsterisk
        //eslint-disable-next-line
        //@ts-expect-error Mantine types doesn't pass additional object propertis to item
        renderOption={renderStoreSelectOption}
      />

      <NumberFormField
        control={control}
        name="price"
        rules={{ required: "Required" }}
        label="Price"
        withAsterisk
        min={0}
        prefix="$"
        decimalScale={2}
        thousandSeparator=","
        rightSection={
          <CalculatorInput
            onEnter={(value) => setValue("price", roundTo(value))}
          />
        }
        rightSectionWidth={36}
      />

      <Switch
        label="Custom Unit"
        checked={customUnitEnabled}
        onClick={({ currentTarget: { checked } }) => {
          form.setValue("customUnit", checked ? "" : null);
          form.setValue("unitTypeId", checked ? null : "");
        }}
      />

      {customUnitEnabled ? (
        <TextFormField
          control={control}
          name="customUnit"
          label="Custom Unit"
          rules={{ required: "Required" }}
          withAsterisk
        />
      ) : (
        <SelectFormField
          control={control}
          name="unitTypeId"
          data={unitTypes.data?.body}
          loading={unitTypes.isLoading}
          label="Unit Type"
          rules={{ required: "Required" }}
          searchable
          withAsterisk
        />
      )}

      <NumberFormField
        control={control}
        name="amount"
        rules={{ required: "Required" }}
        label="Amount"
        withAsterisk
        min={0.01}
        decimalScale={2}
        thousandSeparator=","
        rightSection={
          <CalculatorInput
            onEnter={(value) => setValue("amount", roundTo(value))}
          />
        }
        rightSectionWidth={36}
      />

      <TextFormField control={control} name="description" label="Description" />

      {submitButton}
    </Stack>
  );
};

const renderStoreSelectOption = ({
  option,
  checked,
}: ComboboxLikeRenderOptionInput<{
  value: string;
  label: string;
  image: string | null;
}>) => {
  return (
    <Group flex="1" gap="xs">
      {option.image ? (
        <Image
          component={NextImage}
          height={24}
          width={24}
          h={24}
          w={24}
          src={option.image}
          fallbackSrc="/noImage.svg"
          alt="Logo"
          fit="contain"
          style={{ objectFit: "contain" }}
        />
      ) : (
        <IconPhotoOff size={24} />
      )}
      {option.label}
      {checked && (
        <IconCheck
          style={{ marginInlineStart: "auto" }}
          stroke={1.5}
          color="currentColor"
          opacity={0.6}
          size={18}
        />
      )}
    </Group>
  );
};
