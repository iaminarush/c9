"use client";

import { BarcodeScanner } from "@/components/barcodeScanner";
import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import TextFormField from "@/components/hook-form/TextFormField";
import { recordDetailSchema } from "@/contracts/contract-record";
import { useStoresData, useUnitTypesData } from "@/lib/commonQueries";
import { isNumber } from "@/lib/utils";
import { createRecordSchema } from "@/server/db/schema";
import {
  ActionIcon,
  Button,
  Card,
  ComboboxLikeRenderOptionInput,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  NumberInput,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import {
  IconBarcode,
  IconCheck,
  IconEdit,
  IconPhoto,
  IconPhotoOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import Barcode from "react-barcode";
import {
  SubmitHandler,
  UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  useBarcodes,
  useCreateBarcode,
  useCreateRecord,
  useDeleteBarcode,
  useDeleteItem,
  useDeleteRecord,
  useEditRecord,
  useItem,
  useRecords,
} from "./query";
import { partition, uniqBy } from "ramda";

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

export default function Item({ params: { id } }: { params: { id: string } }) {
  const { isLoading, isError, data } = useItem(id, { enabled: isNumber(id) });

  if (!isNumber(id)) {
    return <Text>Item Id must be a number</Text>;
  }

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Group align="center">
            <Title>{data.body.name}</Title>
            <DeleteComponent id={id} />
          </Group>
          <Group>
            <BarcodeComponent id={id} />

            <AddComponent id={id} />
          </Group>
        </Group>

        <RecordList itemId={id} />
      </Stack>
    </>
  );
}

const FormLayout = ({
  form,
  enableQueries,
  submitButton,
}: {
  form: UseFormReturn<FormSchema>;
  enableQueries: boolean;
  submitButton: ReactNode;
}) => {
  const { control } = form;
  const customUnit = useWatch({ control, name: "customUnit" });

  const customUnitEnabled = typeof customUnit === "string";

  const unitTypes = useUnitTypesData({
    queryOptions: { enabled: enableQueries },
  });
  const stores = useStoresData({ queryOptions: { enabled: enableQueries } });

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
      />

      <Switch
        label="Custom Unit"
        checked={customUnitEnabled}
        onClick={() => {
          form.setValue("customUnit", customUnitEnabled ? null : "");
          form.setValue("unitTypeId", customUnitEnabled ? "" : null);
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
      />

      <TextFormField control={control} name="description" label="Description" />

      {submitButton}
    </Stack>
  );
};

const AddComponent = ({ id }: { id: string }) => {
  const { data } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const createRecord = useCreateRecord(id);
  const form = useForm<FormSchema>({
    defaultValues: {
      itemId: Number(id),
      description: "",
      remark: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    const submitData: FormData = {
      ...data,
      storeId: Number(data.storeId),
      unitTypeId: Number(data.unitTypeId),
      price: `${data.price}`,
      amount: `${data.amount}`,
    };

    const result = createRecordSchema.safeParse(submitData);
    if (result.success) {
      createRecord.mutate({ body: result.data }, { onSuccess: () => close() });
    } else {
      toast.error("Error, view console");
      console.log(result.error);
    }
  };

  return (
    <>
      <Tooltip label="Add record">
        <ActionIcon onClick={open} disabled={!data?.user.admin}>
          <IconPlus />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={close} title="Add Price" centered>
        <FormLayout
          form={form}
          enableQueries={opened}
          submitButton={
            <Button
              onClick={form.handleSubmit(onSubmit)}
              loading={createRecord.isLoading}
            >
              Create Record
            </Button>
          }
        />
      </Modal>
    </>
  );
};

const BarcodeComponent = ({ id }: { id: string }) => {
  const [opened, handlers] = useDisclosure(false);
  const createBarcode = useCreateBarcode();
  const barcodes = useBarcodes(Number(id));
  const { data } = useSession();
  const { mutate, isLoading } = useDeleteBarcode();
  const [scannedBarcode, setScannedBarocde] = useInputState<string | number>(
    "",
  );

  return (
    <>
      <Tooltip label="Add/View barcode">
        <ActionIcon onClick={handlers.open}>
          <IconBarcode />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={handlers.close} title="Barcodes">
        {!!opened && (
          <Tabs defaultValue={data?.user.admin ? "scanner" : "list"}>
            <TabsList mb="xs">
              <TabsTab value="scanner">Scanner</TabsTab>

              <TabsTab value="list">List</TabsTab>
            </TabsList>

            <TabsPanel value="scanner">
              <LoadingOverlay
                visible={createBarcode.isLoading}
                overlayProps={{ blur: 1 }}
              />
              {data?.user.admin ? (
                <>
                  {scannedBarcode ? (
                    <Stack>
                      <NumberInput
                        value={scannedBarcode}
                        onChange={setScannedBarocde}
                        decimalScale={0}
                        label="Barcode"
                      />
                      <Button
                        disabled={
                          !data?.user.admin ||
                          scannedBarcode.toString().length !== 13
                        }
                        onClick={() => {
                          createBarcode.mutate(
                            {
                              body: {
                                barcode: `${scannedBarcode}`,
                                itemId: Number(id),
                              },
                            },
                            {
                              onSuccess: () => {
                                toast.success("Barcode added");
                                handlers.close();
                                setScannedBarocde("");
                              },
                            },
                          );
                        }}
                      >
                        Add Barcode
                      </Button>
                    </Stack>
                  ) : (
                    <BarcodeScanner
                      handleScan={(r) => {
                        setScannedBarocde(r);
                      }}
                    />
                  )}
                </>
              ) : (
                <div>No permission to add barcodes</div>
              )}
            </TabsPanel>

            <TabsPanel value="list">
              <Stack align="center">
                {barcodes.isLoading ? (
                  <Skeleton h={250} />
                ) : barcodes.isError ? (
                  <div>Error</div>
                ) : barcodes.data.body.length ? (
                  barcodes.data.body.map((b) => (
                    <Group key={b.id}>
                      <Barcode
                        key={b.id}
                        value={b.barcode}
                        height={75}
                        width={1.5}
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="lg"
                        disabled={!data?.user.admin}
                        onClick={() =>
                          mutate({ params: { id: `${b.id}` }, body: null })
                        }
                        loading={isLoading}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Group>
                  ))
                ) : (
                  <div>No Barcodes</div>
                )}
              </Stack>
            </TabsPanel>
          </Tabs>
        )}
      </Modal>
    </>
  );
};

const DeleteComponent = ({ id }: { id: string }) => {
  const [opened, handlers] = useDisclosure(false);
  const [value, setValue] = useState("");
  const { mutate, isLoading } = useDeleteItem();
  const router = useRouter();
  const { data } = useSession();

  const handleClick = () => {
    mutate(
      { params: { id }, body: null },
      {
        onSuccess: ({ body }) => {
          router.push(
            body.category
              ? `/categories/${body.category}`
              : "/categories/uncategorized",
          );
          toast.success(`Item ${body.name} deleted`);
        },
      },
    );
  };

  return (
    <>
      <ActionIcon
        variant="filled"
        color="red"
        onClick={handlers.open}
        disabled={!data?.user.admin}
      >
        <IconTrash />
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title="Delete this item?"
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

const RecordList = ({ itemId }: { itemId: string }) => {
  const { data, isFetching, isSuccess } = useRecords(itemId);

  if (isFetching) {
    return <Skeleton />;
  }

  if (isSuccess) {
    if (data.body.length === 0) {
      return <Text>No Records</Text>;
    } else {
      console.log(data.body);
      // const unitFamilies = ((track = new Set()) => (data.body.filter(r => (track.has(r.unitType?.unitFamilyId)))))
      // const customUnitRecords = data.body.filter((r) => !!r.customUnit);

      const [customUnitRecords, standardUnitRecords] = partition(
        (r) => !!r.customUnit,
        data.body,
      );

      const uniqueUnitFamilies = uniqBy(
        (r) => r.unitType?.unitFamilyId,
        standardUnitRecords,
      );

      console.log(uniqueUnitFamilies);

      return (
        <Stack>
          {customUnitRecords.length && (
            <Stack>
              <Text>Custom Unit(s)</Text>
              {customUnitRecords.map((r) => (
                <RecordCard key={r.id} {...r} />
              ))}
            </Stack>
          )}
        </Stack>
      );
    }
    // (
    //   <>
    //     {records.data.body.length ? (
    //       <Stack>
    //         {/* {records.data.body.map((r) => (
    //           <RecordCard key={r.id} {...r} />
    //         ))} */}
    //       </Stack>
    //     ) : (
    //       <Text>No Records</Text>
    //     )}
    //   </>
    // );
  }

  return <Text>Error loading records</Text>;
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
          src={option.image}
          fallbackSrc="/noImage.svg"
          alt="Logo"
          fit="contain"
          style={{ objectFit: "contain", maxWidth: 24 }}
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

type Record = z.infer<typeof recordDetailSchema>;

const RecordCard = (record: Record) => {
  const unitLabel = record.unitType ? record.unitType.name : record.customUnit;

  return (
    <Card p="xs">
      <Group style={{ flexGrow: 1 }} justify="space-between" wrap="nowrap">
        <Stack gap="xs">
          <Group gap="md">
            {record.store.image ? (
              <Image
                component={NextImage}
                src={record.store.image}
                height={48}
                width={48}
                radius="sm"
                alt="Logo"
                style={{ objectFit: "contain", maxWidth: 48 }}
              />
            ) : (
              <IconPhoto size={48} />
            )}
            <Text>{record.store.name}</Text>
            {!!record.description && (
              <>
                &nbsp;
                <Text> - {record.store.name}</Text>
              </>
            )}
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
    },
  });

  const { mutate, isLoading } = useEditRecord();

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    const submitData: FormData = {
      ...data,
      storeId: Number(data.storeId),
      unitTypeId: Number(data.unitTypeId),
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
      toast.error("Error, view console");
      console.log(result.error);
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
