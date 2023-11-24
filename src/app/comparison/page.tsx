"use client";

import { useUnitFamiliesData, useUnitTypesData } from "@/lib/commonQueries";
import {
  ComboboxItem,
  Divider,
  Loader,
  NumberInput,
  Select,
  Stack,
  Switch,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useDidUpdate } from "@mantine/hooks";

export default function Comparison() {
  const [sameFamily, setSameFamily] = useState(true);
  const [unitFamily, setUnitFamily] = useState<string | null>();

  const [price1, setPrice1] = useState<string | number>("");
  const [price2, setPrice2] = useState<string | number>("");
  const [unit1, setUnit1] = useState<string | null>(null);
  const [unit2, setUnit2] = useState<string | null>(null);

  const [parent] = useAutoAnimate({ duration: 200 });

  const unitTypes = useUnitTypesData({});
  const unitFamilies = useUnitFamiliesData({});

  console.log(unitFamilies.data);

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
    } else {
      return [];
    }
  }, [unitFamilies.data, unitFamily, sameFamily]);

  console.log(filteredUnitTypes);

  useDidUpdate(() => {
    if (sameFamily) {
      setUnit1(null);
      setUnit2(null);
    }
  }, [sameFamily]);

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

      <NumberInput
        value={price1}
        onChange={setPrice1}
        label="Price 1"
        prefix="$ "
        min={0}
        decimalScale={2}
        thousandSeparator=","
      />

      <Select
        data={unitTypes.data?.body}
        label="Unit 1"
        value={unit1}
        onChange={setUnit1}
      />

      <Divider />

      <NumberInput
        value={price2}
        onChange={setPrice2}
        label="Price 2"
        prefix="$ "
        min={0}
        decimalScale={2}
        thousandSeparator=","
      />

      <Select
        data={unitTypes.data?.body}
        label="Unit 2"
        value={unit2}
        onChange={setUnit2}
      />
    </Stack>
  );
}
