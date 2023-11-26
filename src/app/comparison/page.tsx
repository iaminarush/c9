"use client";

import { useUnitFamiliesData, useUnitTypesData } from "@/lib/commonQueries";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ComboboxItem,
  Divider,
  Group,
  Loader,
  NumberFormatter,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import { Fragment, useMemo, useState } from "react";
import { number } from "zod";

export default function Comparison() {
  const [sameFamily, setSameFamily] = useState(true);
  const [unitFamily, setUnitFamily] = useState<string | null>();
  const [prices, setPrices] = useState([0, 0]);

  const [parent] = useAutoAnimate({ duration: 200 });

  const unitTypes = useUnitTypesData({});
  const unitFamilies = useUnitFamiliesData({});

  const filteredUnitTypes = useMemo<ComboboxItem[]>(() => {
    if (
      unitTypes.isSuccess &&
      unitFamilies.isSuccess &&
      sameFamily &&
      unitFamily
    ) {
      return unitTypes.data.body.filter(
        (ut) => `${ut.unitFamilyId}` === unitFamily,
      );
    } else if (unitTypes.isSuccess && !sameFamily) {
      return unitTypes.data.body;
    } else {
      return [];
    }
  }, [
    unitFamily,
    sameFamily,
    unitTypes.isSuccess,
    unitFamilies.isSuccess,
    unitTypes.data?.body,
  ]);

  return (
    <Stack ref={parent}>
      <Switch
        label="Same Family Unit"
        checked={sameFamily}
        onChange={(event) => setSameFamily(event.currentTarget.checked)}
      />

      {sameFamily && (
        <Select
          label="Unit Family"
          data={unitFamilies.data?.body}
          rightSection={unitFamilies.isLoading ? <Loader size={16} /> : null}
          value={unitFamily}
          onChange={setUnitFamily}
        />
      )}

      {prices.map((p, i) => (
        <Fragment key={i}>
          <PriceStack
            index={i}
            unitTypes={filteredUnitTypes}
            sameFamily={sameFamily}
          />
          {i + 1 !== prices.length && <Divider />}
        </Fragment>
      ))}
    </Stack>
  );
}

const PriceStack = ({
  index,
  unitTypes,
  sameFamily,
}: {
  index: number;
  unitTypes: ComboboxItem[];
  sameFamily: boolean;
}) => {
  const [price, setPrice] = useState<string | number>("");
  const [amount, setAmount] = useState<string | number>("");
  const [unit, setUnit] = useState<string | null>(null);
  const [unitLabel, setUnitLabel] = useState<string | undefined>("");

  const order = index + 1;

  useDidUpdate(() => {
    setUnit(null);
  }, [sameFamily]);

  return (
    <>
      <Select
        value={unit}
        onChange={(value) => {
          setUnit(value);
          setUnitLabel(unitTypes.find((ut) => ut.value === value)?.label);
        }}
        data={unitTypes}
        label={`Unit ${order}`}
      />

      <NumberInput
        value={price}
        onChange={setPrice}
        label={`Price ${order}`}
        min={0}
        decimalScale={2}
        prefix="$ "
        thousandSeparator=","
      />

      <NumberInput
        value={amount}
        onChange={setAmount}
        label={`Amount ${order}`}
        min={0}
        suffix={unitLabel}
        decimalScale={2}
        thousandSeparator=","
      />

      <Group justify="flex-end" gap={6}>
        Price:
        <NumberFormatter
          prefix="$"
          value={Number(price) / Number(amount) || ""}
          decimalScale={2}
          thousandSeparator=","
        />
        <Text>/</Text>
        {unit ? <Text>{unitLabel}</Text> : "Unit"}
      </Group>
    </>
  );
};
