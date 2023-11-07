"use client";

import SelectFormField from "@/components/hook-form/SelectFormField";
import { client } from "@/contracts/contract";
import { isNumber } from "@/lib/utils";
import { createRecordSchema } from "@/server/db/schema";
import {
  ActionIcon,
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
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useItem } from "./query";
import NumberFormField from "@/components/hook-form/NumberFormField";
import TextFormField from "@/components/hook-form/TextFormField";
import { produce } from "immer";

type FormData = z.infer<typeof createRecordSchema>;

export default function Item({ params: { id } }: { params: { id: string } }) {
  const { isLoading, isError, data } = useItem(id);
  const [opened, { open, close }] = useDisclosure(false);
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      itemId: Number(id),
      description: "",
      remark: "",
    },
  });
  const stores = client.store.getStores.useQuery(
    ["stores"],
    {},
    {
      //@ts-expect-error ts-rest bug
      select: (data) =>
        data.body.map((d) => ({ label: d.name, value: `${d.id}` })),
    },
  );

  if (!isNumber(id)) {
    return <Text>Item Id must be a number</Text>;
  }

  if (isLoading) return <Skeleton />;

  if (isError) return <Text>Error</Text>;

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const submitData = produce(data, (draft) => {
      draft.storeId = Number(draft.storeId);
    });
    console.log(submitData);
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
          />

          <NumberFormField
            control={control}
            name="price"
            rules={{ required: "Required" }}
          />

          <TextFormField control={control} name="description" />

          <TextFormField control={control} name="remark" />
        </Stack>
      </Modal>
    </>
  );
}
