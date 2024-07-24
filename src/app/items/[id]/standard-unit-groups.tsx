import { recordDetailSchema } from "@/contracts/contract-record";
import { unitFamilySchema } from "@/server/db/schema";
import {
  Card,
  ComboboxItem,
  Group,
  Image,
  NumberFormatter,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import convert, { Unit } from "convert";
import NextImage from "next/image";
import { useState } from "react";
import { z } from "zod";
import { StandardUnitRecord } from "./page";
import { useUnitTypesFromFamily } from "./query";
import { DeleteRecordComponent, EditRecordComponent } from "./components";

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

const RAW_OPTION: ComboboxItem = { value: "0", label: "Original" };

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
          label="Unit for comparison"
        />
      </Group>
      {records
        .filter((r) => r.unitType.unitFamilyId === id)
        .map((r) => (
          <RecordCard
            key={r.id}
            {...r}
            selectedUnitId={Number(selectedUnit.value)}
            selectedUnitName={selectedUnit.label as Unit}
          />
        ))}
    </Stack>
  );
};

type Record = z.infer<typeof recordDetailSchema>;

const RecordCard = ({
  selectedUnitId,
  selectedUnitName,
  ...record
}: Record & { selectedUnitId: number; selectedUnitName: Unit }) => {
  const needsConversion =
    !!selectedUnitId &&
    !!record.unitType &&
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

            {needsConversion ? (
              <PriceByUnit
                selectedUnitName={selectedUnitName}
                price={Number(record.price)}
                amount={Number(record.amount)}
                unitType={record.unitType!.name as Unit}
              />
            ) : (
              <NumberFormatter
                prefix="$ "
                suffix={` / ${unitLabel}`}
                value={Number(record.price) / Number(record.amount)}
                // value={perUnitPrice}
                decimalScale={2}
              />
            )}
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

const PriceByUnit = ({
  selectedUnitName,
  price,
  amount,
  unitType,
}: {
  selectedUnitName: Unit;
  price: number;
  amount: number;
  unitType: Unit;
}) => {
  const convertedAmount = convert(amount, unitType).to(selectedUnitName);

  return (
    <NumberFormatter
      prefix="$ "
      suffix={` / ${selectedUnitName}`}
      // value={Number(record.price) / Number(record.amount)}
      value={price / convertedAmount}
      decimalScale={2}
    />
  );
};
