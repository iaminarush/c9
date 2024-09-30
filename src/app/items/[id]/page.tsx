"use client";

import { useCategory } from "@/app/categories/[id]/query";
import BarcodeScanner from "@/components/barcodeScanner";
import { recordDetailSchema } from "@/contracts/contract-record";
import { isNumber, measureTextWidth } from "@/lib/utils";
import {
  createRecordSchema,
  unitFamilySchema,
  unitTypesSchema,
} from "@/server/db/schema";
import {
  ActionIcon,
  Anchor,
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
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useInputState, useViewportSize } from "@mantine/hooks";
import {
  IconBan,
  IconBarcode,
  IconDeviceFloppy,
  IconEdit,
  IconPhoto,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Route } from "next";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next13-progressbar";
import { ReactNode, useState } from "react";
import Barcode from "react-barcode";
import Marquee from "react-fast-marquee";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as R from "remeda";
import useResizeObserver from "use-resize-observer";
import { z } from "zod";
import {
  DeleteRecordComponent,
  EditRecordComponent,
  FormLayout,
} from "./components";
import { AddInventoryComponent, InventoryPanel } from "./inventory";
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
<<<<<<< HEAD
=======
import { useTextWidth } from "@tag0/use-text-width";
import { getTextWidth } from "get-text-width";
>>>>>>> marquee

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
  const [activeTab, setActiveTab] = useState<string | null>("prices");
  const { isLoading, isError, data } = useItem(id, { enabled: isNumber(id) });

  if (!isNumber(id)) {
    return <Text>Item Id must be a number</Text>;
  }

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" gap={8}>
          <TitleComponent
            title={data.body.name}
            categoryId={data.body.category}
            id={id}
            activeTab={activeTab}
          />
        </Group>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          styles={{ panel: { paddingTop: "8px" } }}
        >
          <TabsList>
            <TabsTab value="prices">Prices</TabsTab>
            <TabsTab value="inventory">Inventory</TabsTab>
          </TabsList>

          <TabsPanel value="prices">
            <RecordList itemId={id} />
          </TabsPanel>

          <TabsPanel value="inventory">
            <InventoryPanel id={id} />
          </TabsPanel>
        </Tabs>
      </Stack>
    </>
  );
}

const TitleComponent = ({
  title,
  id,
  categoryId,
  activeTab,
}: {
  title: string;
  id: string;
  categoryId: number | null;
  activeTab: string | null;
}) => {
  const [edit, handlers] = useDisclosure(false);
  const [value, setValue] = useState(title);
  const { mutate, isLoading } = useUpdateItem();
  const { data } = useSession();
  const category = useCategory(categoryId ? `${categoryId}` : "", {
    enabled: !!categoryId,
  });
  const { width: viewportWidth } = useViewportSize();
  const parentWidth = viewportWidth === 0 ? 0 : viewportWidth - 32;

  const { ref, width = 0 } = useResizeObserver();

  const { ref: titleRef, width: titleWidth = 0 } = useResizeObserver();

  const isOverflow = 16 + width + titleWidth > parentWidth;

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

  if (category.isLoading) return <Skeleton w={48} h={16} />;

  if (category.isError) return <Text>Error</Text>;

  if (!edit)
    return (
      <>
        <Group gap={8} wrap={isOverflow ? "nowrap" : undefined}>
          {!!categoryId && (
            <Group gap={8} ref={ref} wrap="nowrap">
              <Anchor
                component={Link}
                href={`/categories/${categoryId}` as Route}
                lineClamp={1}
              >
                {category.data.body.name}
              </Anchor>
              <Text>/</Text>
            </Group>
          )}

          <Text ref={titleRef}>{title}</Text>
          {/* <MarqueeWrapper display={isOverflow}>
            <Text fw={700} ref={titleRef}>
              {title}
            </Text>
          </MarqueeWrapper> */}
        </Group>

        <Group justify="space-between" style={{ flexGrow: 1 }}>
          <Group>
            <ActionIcon onClick={handlers.open} disabled={!data?.user.admin}>
              <IconEdit />
            </ActionIcon>
            <DeleteComponent id={id} />
          </Group>

          <Group>
            {activeTab === "prices" && (
              <>
                <BarcodeComponent id={id} />
                <AddComponent id={id} />
              </>
            )}
            {activeTab === "inventory" && <AddInventoryComponent id={id} />}
          </Group>
        </Group>
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

const MarqueeWrapper = ({
  children,
  display,
}: {
  children: ReactNode;
  display: boolean;
}) => {
  if (display) return <Marquee>{children}</Marquee>;

  return children;
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
      unitTypeId: data.unitTypeId ? Number(data.unitTypeId) : null,
      price: `${data.price}`,
      amount: `${data.amount}`,
    };

    const result = createRecordSchema.safeParse(submitData);
    if (result.success) {
      createRecord.mutate(
        { body: result.data },
        {
          onSuccess: () => {
            close();
            form.reset({ itemId: Number(id) });
          },
        },
      );
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
