"use client";

import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import { client } from "@/contracts/contract";
import { recordDetailSchema } from "@/contracts/contract-record";
import { useStoresData, useUnitTypesData } from "@/lib/commonQueries";
import { isNumber } from "@/lib/utils";
import { createRecordSchema } from "@/server/db/schema";
import {
  ActionIcon,
  Button,
  Card,
  ComboboxItem,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { produce } from "immer";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateRecord, useItem } from "./query";
import { toast } from "react-hot-toast";

type FormData = z.infer<typeof createRecordSchema>;

export default function Item({ params: { id } }: { params: { id: string } }) {
  const { isLoading, isError, data } = useItem(id, { enabled: isNumber(id) });
  const [opened, { open, close }] = useDisclosure(false);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      itemId: Number(id),
      description: "",
      remark: "",
    },
  });
  const stores = useStoresData({ queryOptions: { enabled: opened } });
  const unitTypes = useUnitTypesData({ queryOptions: { enabled: opened } });
  const createRecord = useCreateRecord();

  if (!isNumber(id)) {
    return <Text>Item Id must be a number</Text>;
  }

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const submitData = produce(data, (draft) => {
      draft.storeId = Number(draft.storeId);
      // draft.unitTypeId = Number(draft.unitTypeId);
      draft.price = `${draft.price}`;
    });

    const result = createRecordSchema.safeParse(submitData);
    if (result.success) {
      createRecord.mutate({ body: result.data });
    } else {
      toast.error("Error, view console");
      console.log(result.error.issues);
    }
  };

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Title>{data.body.name}</Title>
          <ActionIcon onClick={open}>
            <IconPlus />
          </ActionIcon>
        </Group>

        <RecordList recordId={id} />
      </Stack>

      <Modal opened={opened} onClose={close} title="Add Price" centered>
        <Stack>
          <SelectFormField
            control={control}
            name="storeId"
            data={stores.data as unknown as ComboboxItem[]}
            loading={stores.isLoading}
            label="Store"
            rules={{ required: "Required" }}
            searchable
            withAsterisk
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
            data={unitTypes.data as unknown as ComboboxItem[]}
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
            decimalScale={0}
            thousandSeparator=","
          />

          {/* <TextFormField
            control={control}
            name="description"
            label="Description"
          />

          <TextFormField control={control} name="remark" label="Remark" /> */}

          <Button onClick={() => void handleSubmit(onSubmit)()}>Submit</Button>
        </Stack>
      </Modal>
    </>
  );
}

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

  return (
    <>
      <></>
    </>
  );
};

type Record = z.infer<typeof recordDetailSchema>;

const RecordCard = (record: Record) => {
  return (
    <Card>
      <Text>{record.storeId}</Text>
    </Card>
  );
};
