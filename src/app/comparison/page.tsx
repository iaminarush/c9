"use client";

import NumberFormField from "@/components/hook-form/NumberFormField";
import SelectFormField from "@/components/hook-form/SelectFormField";
import SwitchFormField from "@/components/hook-form/SwitchFormField";
import { UnitTypes } from "@/contracts/contract-unitType";
import {
  useUnitFamiliesData,
  useUnitTypesData
} from "@/lib/commonQueries";
import { isNumber } from "@/lib/utils";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Grid,
  GridCol,
  Group,
  NumberFormatter,
  Stack,
  Text,
} from "@mantine/core";
import { useDidUpdate, useWindowScroll } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import convert, { Mass, Volume } from "convert";
import { useMemo, useState } from "react";
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
  const [unitFamilyLabel, setUnitFamilyLabel] = useState<string | undefined>();

  const unitTypes = useUnitTypesData({});
  const unitFamilies = useUnitFamiliesData({});
  //TODO
  // const kek = useUnitFamilies({
  //   queryOptions: {
  //     select: ({ body }) =>
  //       body.map((b) => ({ value: `${b.id}`, label: b.name })),
  //   },
  // });

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
  }, [sameUnitFamily, unitFamilies.data]);

  const filteredUnitTypes = useMemo(() => {
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
          onChange={(value) =>
            setUnitFamilyLabel(
              unitFamilies.data?.body.find((uf) => uf.value === value)?.label,
            )
          }
        />
      )}

      <Divider mt={12} />

      <Grid>
        {fields.map((field, index) => (
          <GridCol span={6} key={field.key}>
            <PriceStack
              index={index}
              unitTypes={filteredUnitTypes as UnitTypes[]}
              length={fields.length}
              control={control}
              remove={remove}
              unitFamilyLabel={unitFamilyLabel}
            />
            {/* {index + 1 !== fields.length && <Divider mt={4} />} */}
          </GridCol>
        ))}
      </Grid>

      {/* <Divider mb={8} /> */}

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
  unitFamilyLabel,
}: {
  index: number;
  // unitTypes: z.infer<typeof unitTypesZod>[];
  unitTypes: UnitTypes[];
  length: number;
  control: Control<FormData>;
  remove: UseFieldArrayRemove;
  unitFamilyLabel: string | undefined;
}) => {
  const order = index + 1;

  const sameUnitFamily = useWatch({ control, name: "sameUnitFamily" });
  const price = useWatch({ control, name: `prices.${index}.price` });
  const amount = useWatch({ control, name: `prices.${index}.amount` });
  const unit = useWatch({ control, name: `prices.${index}.unit` });
  const unitFamily = useWatch({ control, name: "unitFamily" });

  const unitFamilies = useUnitFamiliesData({});

  const standardUnit = (() => {
    if (!sameUnitFamily) {
      return "unit";
    } else {
      if (unitFamilyLabel === "Mass") {
        return "g";
      } else if (unitFamilyLabel === "Volume") {
        return "ml";
      } else return "unit";
    }
  })();

  const unitLabel = useMemo(() => {
    if (unitFamily && unit) {
      const _unit = unitTypes.find((ut) => ut.value === unit)?.label;

      if (_unit) {
        return _unit;
      } else return "";
    } else return "";
  }, [unit, unitTypes, unitFamily]);

  const convertedAmount = useMemo(() => {
    if (sameUnitFamily) {
      const unitFamilyName = unitFamilies.data?.body.find(
        (uf) => uf.value === unitFamily,
      )?.label;
      if (unitFamilyName && isNumber(amount) && unitLabel) {
        if (unitFamilyName === "Mass") {
          return convert(Number(amount), unitLabel as Mass).to("g");
        } else if (unitFamilyName === "Volume") {
          return convert(Number(amount), unitLabel as Volume).to("mL");
        }
      }
    }
  }, [sameUnitFamily, unitFamilies.data?.body, unitFamily, amount, unitLabel]);

  return (
    <Stack gap={4}>
      <Group>
        <Stack style={{ flexGrow: 1 }} gap={4} justify="center" align="stretch">
          <SelectFormField
            control={control}
            name={`prices.${index}.unit`}
            data={unitTypes}
            label={`Unit ${order}`}
          />

          <NumberFormField
            control={control}
            name={`prices.${index}.price`}
            label={`Price ${order}`}
            min={0}
            decimalScale={2}
            prefix="$ "
            thousandSeparator=","
          />

          <NumberFormField
            control={control}
            name={`prices.${index}.amount`}
            label={`Amount ${order}`}
            min={0}
            decimalScale={2}
            suffix={` ${unitLabel}`}
            thousandSeparator=","
          />
        </Stack>

        {length > 2 && (
          <Center inline>
            <ActionIcon
              color="red"
              variant="filled"
              onClick={() => remove(index)}
            >
              <IconTrash />
            </ActionIcon>
          </Center>
        )}
      </Group>

      <Group justify="flex-end" gap={6}>
        <Text>Price:</Text>
        <NumberFormatter
          prefix="$"
          value={Number(price) / Number(convertedAmount) || ""}
          decimalScale={2}
          thousandSeparator=","
        />
        <Text>/</Text>
        <Text>{standardUnit}</Text>
      </Group>
    </Stack>
  );
};
