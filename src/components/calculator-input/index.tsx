"use client";

import {
  ActionIcon,
  Button,
  Grid,
  GridCol,
  GridColProps,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { useDisclosure, useUncontrolled } from "@mantine/hooks";
import { IconCalculator } from "@tabler/icons-react";
import { ReactNode, useState } from "react";

type Props = {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
};

const ColButton = ({
  span = 3,
  value,
  ...rest
}: GridColProps & { value: string }) => {
  return (
    <GridCol span={span} {...rest}>
      <Button w="100%">{value}</Button>
    </GridCol>
  );
};

const ColCalculate = ({ span = 3, children, ...rest }: GridColProps) => (
  <GridCol span={span} {...rest}>
    <Button color="yellow" variant="filled" w="100%">
      {children}
    </Button>
  </GridCol>
);

export default function CalculatorInput() {
  const [opened, handlers] = useDisclosure();
  const [value, setValue] = useState("");

  const appendValue = (_value: string) => setValue(value + _value);

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconCalculator />
      </ActionIcon>
      <Modal opened={opened} onClose={handlers.close} centered>
        <Stack>
          <NumberInput inputMode="none" value={value} />
          <Grid gutter={8} grow>
            <ColCalculate offset={9}>÷</ColCalculate>

            <ColButton value="7" />
            <ColButton value="8" />
            <ColButton value="9" />
            <ColCalculate>×</ColCalculate>

            <ColButton value="6" />
            <ColButton value="5" />
            <ColButton value="4" />
            <ColCalculate>−</ColCalculate>

            <ColButton value="3" />
            <ColButton value="2" />
            <ColButton value="1" />
            <ColCalculate>+</ColCalculate>

            <ColButton value="0" />
            <ColButton value="." />
            <ColCalculate>=</ColCalculate>
          </Grid>
        </Stack>
      </Modal>
    </>
  );
}
