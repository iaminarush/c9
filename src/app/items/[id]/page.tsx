"use client";

import BarcodeScanner from "@/components/barcodeScanner";
import { recordDetailSchema } from "@/contracts/contract-record";
import { isNumber } from "@/lib/utils";
import {
  createRecordSchema,
  unitFamilySchema,
  unitTypesSchema,
} from "@/server/db/schema";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  NumberInput,
  Skeleton,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  TextInput,
  Title,
  Tooltip
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import {
  IconBan,
  IconBarcode,
  IconDeviceFloppy,
  IconEdit,
  IconPhoto,
  IconPlus,
  IconTrash
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Barcode from "react-barcode";
import {
  SubmitHandler,
  useForm
} from "react-hook-form";
import { toast } from "react-hot-toast";
import * as R from "remeda";
import { z } from "zod";
import { DeleteRecordComponent, EditRecordComponent, FormLayout } from "./components";
import {
  useBarcodes,
  useCreateBarcode,
  useCreateRecord,
  useDeleteBarcode,
  useDeleteItem,
  useItem,
  useRecords,
  useUpdateItem,
} from "./query";
import StandardUnitGroups from "./standard-unit-groups";

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
            <TitleComponent title={data.body.name} id={id} />
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

const TitleComponent = ({ title, id }: { title: string; id: string }) => {
  const [edit, handlers] = useDisclosure(false);
  const [value, setValue] = useState(title);
  const { mutate, isLoading } = useUpdateItem();
  const { data } = useSession();

  const handleUpdate = () => {
    mutate(
      { body: { name: value }, params: { id } },
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
        <Title order={3}>{title}</Title>
        <ActionIcon onClick={handlers.open} disabled={!data?.user.admin}>
          <IconEdit />
        </ActionIcon>
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
              <IconBan />
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

// const FormLayout = ({
//   form,
//   enableQueries,
//   submitButton,
//   create,
// }: {
//   form: UseFormReturn<FormSchema>;
//   enableQueries: boolean;
//   submitButton: ReactNode;
//   create?: boolean;
// }) => {
//   const { control, setValue } = form;
//   const customUnit = useWatch({ control, name: "customUnit" });

//   const customUnitEnabled = typeof customUnit === "string";

//   const unitTypes = useUnitTypesData({
//     queryOptions: { enabled: enableQueries },
//   });
//   const stores = useStoresData({ queryOptions: { enabled: enableQueries } });

//   useEffect(() => {
//     if (unitTypes.isSuccess && create) {
//       const gram = unitTypes.data.body.find((ut) => ut.label === "g");
//       if (gram) form.setValue("unitTypeId", gram.value);
//     }
//   }, [unitTypes.isSuccess]);

//   return (
//     <Stack>
//       <SelectFormField
//         control={control}
//         name="storeId"
//         data={stores.data?.body}
//         loading={stores.isLoading}
//         label="Store"
//         rules={{ required: "Required" }}
//         searchable
//         withAsterisk
//         //eslint-disable-next-line
//         //@ts-expect-error Mantine types doesn't pass additional object propertis to item
//         renderOption={renderStoreSelectOption}
//       />

//       <NumberFormField
//         control={control}
//         name="price"
//         rules={{ required: "Required" }}
//         label="Price"
//         withAsterisk
//         min={0}
//         prefix="$"
//         decimalScale={2}
//         thousandSeparator=","
//         rightSection={
//           <CalculatorInput onEnter={(value) => setValue("price", value)} />
//         }
//         rightSectionWidth={36}
//       />

//       <Switch
//         label="Custom Unit"
//         checked={customUnitEnabled}
//         onClick={({ currentTarget: { checked } }) => {
//           form.setValue("customUnit", checked ? "" : null);
//           form.setValue("unitTypeId", checked ? null : "");
//         }}
//       />

//       {customUnitEnabled ? (
//         <TextFormField
//           control={control}
//           name="customUnit"
//           label="Custom Unit"
//           rules={{ required: "Required" }}
//           withAsterisk
//         />
//       ) : (
//         <SelectFormField
//           control={control}
//           name="unitTypeId"
//           data={unitTypes.data?.body}
//           loading={unitTypes.isLoading}
//           label="Unit Type"
//           rules={{ required: "Required" }}
//           searchable
//           withAsterisk
//         />
//       )}

//       <NumberFormField
//         control={control}
//         name="amount"
//         rules={{ required: "Required" }}
//         label="Amount"
//         withAsterisk
//         min={0.01}
//         decimalScale={2}
//         thousandSeparator=","
//         rightSection={
//           <CalculatorInput onEnter={(value) => setValue("amount", value)} />
//         }
//         rightSectionWidth={36}
//       />

//       <TextFormField control={control} name="description" label="Description" />

//       {submitButton}
//     </Stack>
//   );
// };

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
      unitTypeId: data.unitTypeId ? Number(data.unitTypeId) : null,
      price: `${data.price}`,
      amount: `${data.amount}`,
    };

    const result = createRecordSchema.safeParse(submitData);
    if (result.success) {
      createRecord.mutate({ body: result.data }, { onSuccess: () => close() });
    } else {
      toast.error("Error occured when creating");
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
          create={true}
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

const customUnitRecordSchema = recordDetailSchema.merge(
  z.object({ customUnit: z.string() }),
);

const standardUnitRecordSchema = recordDetailSchema.merge(
  z.object({
    unitType: unitTypesSchema.merge(z.object({ unitFamily: unitFamilySchema })),
  }),
);

export type CustomUnitRecord = z.infer<typeof customUnitRecordSchema>;

export type StandardUnitRecord = z.infer<typeof standardUnitRecordSchema>;

const RecordList = ({ itemId }: { itemId: string }) => {
  const { data, isFetching, isSuccess } = useRecords(itemId);

  if (isFetching) {
    return <Skeleton />;
  }

  if (isSuccess) {
    if (data.body.length === 0) {
      return <Text>No Records</Text>;
    } else {
      const customUnitRecords = data.body.filter(
        (r) => !!r.customUnit,
      ) as CustomUnitRecord[];
      const standardUnitRecords = data.body.filter(
        (r) => !!r.unitType,
      ) as StandardUnitRecord[];

      const uniqueUnitFamilies = R.uniqueBy(
        standardUnitRecords,
        (r) => r.unitType.unitFamilyId,
      ).map((r) => ({
        id: r.unitType.unitFamilyId,
        name: r.unitType.unitFamily.name,
      }));

      return (
        <Stack>
          {!!standardUnitRecords.length && (
            <Stack>
              <StandardUnitGroups
                unitFamilies={uniqueUnitFamilies}
                records={standardUnitRecords}
              />
            </Stack>
          )}
          {!!customUnitRecords.length && (
            <Stack>
              <Title order={4}>Custom Units</Title>
              {customUnitRecords.map((r) => (
                <RecordCard key={r.id} {...r} />
              ))}
            </Stack>
          )}
        </Stack>
      );
    }
  }

  return <Text>Error loading records</Text>;
};


export type Record = z.infer<typeof recordDetailSchema>;

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
            {/* {!!record.description && (
              <>
                &nbsp;
                <Text> - {record.store.name}</Text>
              </>
            )} */}
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
