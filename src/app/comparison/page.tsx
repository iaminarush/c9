"use client";

import { useUnitTypesData } from "@/lib/commonQueries";
import {
  Center,
  ComboboxItem,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useState } from "react";

export default function Comparison() {
  const [sameFamily, setSameFamily] = useState(true);
  const [price1, setPrice1] = useState<string | number>("");

  const unitTypes = useUnitTypesData({});

  return (
    <Stack>
      <Switch
        label="Same Family Unit"
        checked={sameFamily}
        onChange={(event) => setSameFamily(event.currentTarget.checked)}
      />

      <NumberInput
        value={price1}
        onChange={setPrice1}
        label="Price 1"
        prefix="$ "
        min={0}
        decimalScale={2}
        thousandSeparator=","
      />

      <Select data={unitTypes.data as unknown as ComboboxItem[]} label="Unit" />
    </Stack>
  );
}
