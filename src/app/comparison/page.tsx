"use client";

import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import SwitchFormField from "@/components/hook-form/SwitchFormField";
import { useUnitFamiliesData, useUnitTypesData } from "@/lib/commonQueries";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ActionIcon,
  Button,
  ComboboxItem,
  Divider,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { useDidUpdate, useWindowScroll } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import convert, { Mass, Volume } from "convert";
import { Fragment, useMemo, useState } from "react";
import {
  Control,
  UseFieldArrayRemove,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";

type FormData = {
  sameUnitFamily: boolean;
  unitFamily: string | null;
  prices: {
    price: string | number;
    amount: string | number;
    unit: string | null;
  }[];
};

export default function Comparison() {
  const [parent] = useAutoAnimate({ duration: 200 });
  const [scroll, scrollTo] = useWindowScroll();

  const unitTypes = useUnitTypesData({});
  const unitFamilies = useUnitFamiliesData({});

  const form = useForm<FormData>({
    defaultValues: {
      sameUnitFamily: true,
      unitFamily: null,
      prices: [
        { price: "", amount: "", unit: null },
        { price: "", amount: "", unit: null },
      ],
    },
  });

  const { control, setValue } = form;

  const fieldArray = useFieldArray({
    control,
    name: "prices",
    rules: { minLength: 2 },
    keyName: "key",
  });

  const { fields, append, remove } = fieldArray;

  const sameUnitFamily = useWatch({ control, name: "sameUnitFamily" });
  const unitFamily = useWatch({ control, name: "unitFamily" });

  useDidUpdate(() => {
    fields.map((field, index) => {
      setValue(`prices.${index}.unit`, null);
    });
  }, [sameUnitFamily, unitFamilies]);

  const filteredUnitTypes = useMemo<ComboboxItem[]>(() => {
    if (
      unitTypes.isSuccess &&
      unitFamilies.isSuccess &&
      sameUnitFamily &&
      unitFamily
    ) {
      return unitTypes.data.body.filter(
        (ut) => `${ut.unitFamilyId}` === unitFamily,
      );
    } else if (unitTypes.isSuccess && !sameUnitFamily) {
      return unitTypes.data.body;
    } else {
      return [];
    }
  }, [
    unitFamily,
    sameUnitFamily,
    unitTypes.isSuccess,
    unitFamilies.isSuccess,
    unitTypes.data?.body,
  ]);

  return (
    <Stack ref={parent} gap={4}>
      <SwitchFormField
        control={control}
        name="sameUnitFamily"
        label="Same Unit Family"
      />

      {sameUnitFamily && (
        <SelectFormField
          control={control}
          name="unitFamily"
          data={unitFamilies.data?.body}
          loading={unitFamilies.isLoading}
          label="Unit Family"
        />
      )}

      <Divider mt={12} />

      {fields.map((field, index) => (
        <Fragment key={field.key}>
          <PriceStack
            index={index}
            unitTypes={filteredUnitTypes}
            length={fields.length}
            control={control}
            remove={remove}
          />
          {index + 1 !== fields.length && <Divider mt={4} />}
        </Fragment>
      ))}

      <Divider mb={8} />

      <Button
        onClick={() => {
          append({ price: "", amount: "", unit: null }, { shouldFocus: false });
          setTimeout(() => {
            scrollTo({ y: scroll.y + 9999 });
          }, 250);
        }}
      >
        Add
      </Button>
    </Stack>
  );
}

const PriceStack = ({
  index,
  unitTypes,
  length,
  control,
  remove,
}: {
  index: number;
  unitTypes: ComboboxItem[];
  length: number;
  control: Control<FormData>;
  remove: UseFieldArrayRemove;
}) => {
  const [unitLabel, setUnitLabel] = useState<Mass | Volume | undefined>();

  const order = index + 1;

  const sameUnitFamily = useWatch({ control, name: "sameUnitFamily" });
  const price = useWatch({ control, name: `prices.${index}.price` });
  const amount = useWatch({ control, name: `prices.${index}.amount` });
  const unit = useWatch({ control, name: `prices.${index}.unit` });

  // const standardUnit = (() => {
  //   if (!sameUnitFamily) {
  //     return "Unit";
  //   } else {

  //   }
  // })();

  console.log(unit);

  return (
    <>
      <Group>
        <Stack style={{ flexGrow: 1 }} gap={4}>
          <SelectFormField
            control={control}
            name={`prices.${index}.unit`}
            data={unitTypes}
            label={`Unit ${order}`}
            onChange={(value) => {
              setUnitLabel(unitTypes.find((ut) => ut.value === value)?.label);
            }}
          />

          <NumberFormField
            control={control}
            name={`prices.${index}.amount`}
            label={`Price ${order}`}
            min={0}
            decimalScale={2}
            prefix="$ "
            thousandSeparator=","
          />

          <NumberFormField
            control={control}
            name={`prices.${index}.price`}
            label={`Amount ${order}`}
            min={0}
            decimalScale={2}
            suffix={` ${unitLabel}`}
            thousandSeparator=","
          />
        </Stack>

        {length > 2 && (
          <ActionIcon
            color="red"
            variant="filled"
            onClick={() => remove(index)}
          >
            <IconTrash />
          </ActionIcon>
        )}
      </Group>

      <Group justify="flex-end" gap={6}>
        <Text>Price:</Text>
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
