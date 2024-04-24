"use client";

import { BarcodeScanner } from "@/components/barcodeScanner";
import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import TextFormField from "@/components/hook-form/TextFormField";
import { client } from "@/contracts/contract";
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
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  useBarcodes,
  useCreateBarcode,
  useCreateRecord,
  useDeleteBarcode,
  useDeleteItem,
  useEditRecord,
  useItem,
} from "./query";
import Barcode from "react-barcode";

type FormData = z.infer<typeof createRecordSchema>;

const formSchema = createRecordSchema.merge(
  z.object({
    storeId: z.string(),
    unitTypeId: z.string(),
    price: z.number(),
    amount: z.number(),
  }),
);

type FormSchema = z.infer<typeof formSchema>;

export default function Item({ params: { id } }: { params: { id: string } }) {
  const { isLoading, isError, data } = useItem(id, { enabled: isNumber(id) });

  if (!isNumber(id)) {
    return <Text>Item Id must be a number</Text>;
  }

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  //TODO edit records
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

        <RecordList recordId={id} />
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

const RecordList = ({ recordId }: { recordId: string }) => {
  const records = client.records.getRecords.useQuery(["record", recordId], {
    query: { item: Number(recordId) },
  });

  if (records.isFetching) {
    return <Skeleton />;
  }

  if (records.isSuccess) {
    return (
      <>
        {records.data.body.length ? (
          <Stack>
            {records.data.body.map((r) => (
              <RecordCard key={r.id} {...r} />
            ))}
          </Stack>
        ) : (
          <Text>No Records</Text>
        )}
      </>
    );
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
          h={24}
          w={24}
          src={option.image}
          fallbackSrc="https://placehold.co/600x400?text=No%20Image"
          alt="Logo"
          fit="contain"
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
  return (
    <Card p="xs">
      <Group style={{ flexGrow: 1 }} justify="space-between" wrap="nowrap">
        <Stack gap="xs">
          <Group gap="md">
            {record.store.image ? (
              <Image
                src={record.store.image}
                h={48}
                w={48}
                radius="sm"
                alt="Logo"
                fit="contain"
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
                Weight: {record.amount} {record.unitType.name}
              </Text>
            </Group>

            <NumberFormatter
              prefix="$ "
              suffix={` / ${record.unitType.name}`}
              value={Number(record.price) / Number(record.amount)}
              decimalScale={2}
            />
          </Group>
        </Stack>

        <Stack>
          <EditRecordComponent record={record} />

          <DeleteRecordComponent />
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

      <Modal opened={opened} onClose={handlers.close}>
        {!!opened && <EditForm record={record} />}
      </Modal>
    </>
  );
};

const EditForm = ({ record }: { record: Record }) => {
  const form = useForm<FormSchema>({
    defaultValues: {
      storeId: `${record.storeId}`,
      price: Number(record.price),
      unitTypeId: `${record.unitTypeId}`,
      amount: Number(record.amount),
      itemId: record.itemId,
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
            close();
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

const DeleteRecordComponent = () => {
  const [opened, handlers] = useDisclosure(false);

  return (
    <>
      <Tooltip label="Delete Record">
        <ActionIcon color="red" variant="filled">
          <IconTrash />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={handlers.close}></Modal>
    </>
  );
};
