import CalculatorInput from "@/components/calculator-input";
import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import TextFormField from "@/components/hook-form/TextFormField";
import { recordDetailSchema } from "@/contracts/contract-record";
import { useStoresData, useUnitTypesData } from "@/lib/commonQueries";
import { createRecordSchema, unitFamilySchema } from "@/server/db/schema";
import {
  ActionIcon,
  Button,
  Card,
  ComboboxItem,
  Group,
  Image,
  Modal,
  NumberFormatter,
  Select,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconPhoto, IconTrash } from "@tabler/icons-react";
import NextImage from "next/image";
import { ReactNode, useEffect, useState } from "react";
import {
  SubmitHandler,
  UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { StandardUnitRecord } from "./page";
import {
  useDeleteRecord,
  useEditRecord,
  useUnitTypesFromFamily,
} from "./query";

type UnitFamily = z.infer<typeof unitFamilySchema>;

export default function StandardUnitGroups({
  unitFamilies,
  records,
}: {
  unitFamilies: UnitFamily[];
  records: StandardUnitRecord[];
}) {
  return (
    <>
      {unitFamilies.map((u) => (
        <StandardUnitGroup key={u.id} records={records} {...u} />
      ))}
    </>
  );
}

const RAW_OPTION: ComboboxItem = { value: "0", label: "Raw" };

const StandardUnitGroup = ({
  records,
  id,
  name,
}: {
  records: StandardUnitRecord[];
} & UnitFamily) => {
  const { data } = useUnitTypesFromFamily(id);
  const [selectedUnit, setSelectedUnit] = useState<ComboboxItem>(RAW_OPTION);

  const selection = [RAW_OPTION].concat(data || []);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={4}>{name}</Title>
        <Select
          value={selectedUnit.value}
          onChange={(value, option) => setSelectedUnit(option)}
          data={selection}
        />
      </Group>
      {records
        .filter((r) => r.unitType.unitFamilyId === id)
        .map((r) => (
          <RecordCard
            key={r.id}
            {...r}
            selectedUnitId={Number(selectedUnit.value)}
          />
        ))}
    </Stack>
  );
};

type Record = z.infer<typeof recordDetailSchema>;

const RecordCard = ({
  selectedUnitId,
  ...record
}: Record & { selectedUnitId: number }) => {
  const isStandard = !!record.customUnit;
  const needsConversion =
    !!selectedUnitId &&
    record.unitType?.id &&
    selectedUnitId !== record.unitType.id;
  const unitLabel = record.unitType ? record.unitType.name : record.customUnit;

  return (
    <Card p="xs">
      <Group style={{ flexGrow: 1 }} justify="space-between" wrap="nowrap">
        <Stack gap="xs">
          <Group gap="md">
            {record.store.image ? (
              <Image
                component={NextImage}
                height={48}
                width={48}
                h={48}
                w={48}
                src={record.store.image}
                fallbackSrc="/noImage.svg"
                alt="Logo"
                radius="sm"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <IconPhoto size={48} />
            )}
            <Text>{record.store.name}</Text>
          </Group>

          <Group justify="space-between">
            <Group>
              <NumberFormatter
                prefix="$ "
                value={record.price}
                thousandSeparator
              />

              <Text>
                Weight: {record.amount} {unitLabel}
              </Text>
            </Group>

            <NumberFormatter
              prefix="$ "
              suffix={` / ${unitLabel}`}
              value={Number(record.price) / Number(record.amount)}
              decimalScale={2}
            />
          </Group>
        </Stack>

        <Stack>
          <EditRecordComponent record={record} />

          <DeleteRecordComponent itemId={record.itemId} recordId={record.id} />
        </Stack>
      </Group>
    </Card>
  );
};

const EditRecordComponent = ({ record }: { record: Record }) => {
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

type FormData = z.infer<typeof createRecordSchema>;

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

const DeleteRecordComponent = ({
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

const FormLayout = ({
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

  useEffect(() => {
    if (unitTypes.isSuccess && create) {
      const gram = unitTypes.data.body.find((ut) => ut.label === "g");
      if (gram) form.setValue("unitTypeId", gram.value);
    }
  }, [unitTypes.isSuccess]);

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
          <CalculatorInput onEnter={(value) => setValue("price", value)} />
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
          <CalculatorInput onEnter={(value) => setValue("amount", value)} />
        }
        rightSectionWidth={36}
      />

      <TextFormField control={control} name="description" label="Description" />

      {submitButton}
    </Stack>
  );
};
