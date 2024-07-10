"use client";

import {
  ActionIcon,
  Button,
  Grid,
  GridCol,
  GridColProps,
  Modal,
  NumberFormatter,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalculator } from "@tabler/icons-react";
import { useCallback, useState } from "react";

const ColButton = ({
  span = 3,
  value,
  appendValue,
  disabled,
  ...rest
}: GridColProps & {
  value: string;
  appendValue: (value: string) => void;
  disabled?: boolean;
}) => {
  return (
    <GridCol span={span} {...rest}>
      <Button w="100%" onClick={() => appendValue(value)} disabled={disabled}>
        {value}
      </Button>
    </GridCol>
  );
};

const ColCalculate = ({
  span = 3,
  children,
  disabled,
  handleClick,
  ...rest
}: GridColProps & { disabled?: boolean; handleClick: () => void }) => (
  <GridCol span={span} {...rest}>
    <Button
      color="yellow"
      variant="filled"
      w="100%"
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </Button>
  </GridCol>
);

type Action = "divide" | "times" | "minus" | "plus";

type State = { value: string; preCalc: string; action: Action | "" };

const initialState: State = { value: "", preCalc: "", action: "" };

const calculate = (a: string, b: string, action: Action) => {
  const valueA = Number(a);
  const valueB = Number(b);
  switch (action) {
    case "divide":
      return valueA / valueB;
    case "minus":
      return valueA - valueB;
    case "plus":
      return valueA + valueB;
    case "times":
      return valueA * valueB;
    default:
      return valueA;
  }
};

export default function CalculatorInput() {
  const [opened, handlers] = useDisclosure();
  const [state, setState] = useState<State>({
    value: "",
    preCalc: "",
    action: "",
  });

  console.log(state);

  const appendValue = (value: string) => {
    console.log("append", state);
    if (state.action && state.preCalc) {
      setState({ ...state, preCalc: state.value, value });
    } else if (state.preCalc && !state.value) {
      setState({ ...state, value });
    } else {
      setState({ ...state, value: state.value + value });
    }
  };

  const prepCalculation = (action: Action) => {
    if (state.preCalc && state.value) {
      setState({
        ...state,
        value: calculate(state.preCalc, state.value, action).toString(),
        action: "",
      });
    } else if (state.preCalc && !state.value) {
      setState({
        ...state,
        action,
      });
    } else {
      setState({ ...state, value: "", preCalc: state.value, action });
    }
  };

  const handleClose = useCallback(() => {
    handlers.close();
    setState(initialState);
  }, [handlers]);

  const hasDecimal = state.value.includes(".");
  const isValue = !!state.value;
  const isPreCalcValue = !!state.preCalc;

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconCalculator />
      </ActionIcon>
      <Modal opened={opened} onClose={handleClose} centered>
        <Stack>
          <Stack align="flex-end" gap="xs">
            <div style={{ height: 25 }}>
              <NumberFormatter value={state.preCalc} thousandSeparator />
            </div>
            <div style={{ height: 28 }}>
              <NumberFormatter
                value={state.value}
                thousandSeparator
                style={{ fontSize: 24 }}
              />
            </div>
          </Stack>
          <Grid gutter={8}>
            <GridCol span={3}>
              <Button
                w="100%"
                color="red"
                variant="filled"
                onClick={() => setState(initialState)}
              >
                A/C
              </Button>
            </GridCol>
            <ColCalculate
              offset={6}
              disabled={!isValue}
              handleClick={() => prepCalculation("divide")}
            >
              ÷
            </ColCalculate>

            <ColButton value="7" appendValue={appendValue} />
            <ColButton value="8" appendValue={appendValue} />
            <ColButton value="9" appendValue={appendValue} />
            <ColCalculate
              disabled={!isValue}
              handleClick={() => prepCalculation("times")}
            >
              ×
            </ColCalculate>

            <ColButton value="4" appendValue={appendValue} />
            <ColButton value="5" appendValue={appendValue} />
            <ColButton value="6" appendValue={appendValue} />
            <ColCalculate
              disabled={!isValue}
              handleClick={() => prepCalculation("minus")}
            >
              −
            </ColCalculate>

            <ColButton value="1" appendValue={appendValue} />
            <ColButton value="2" appendValue={appendValue} />
            <ColButton value="3" appendValue={appendValue} />
            <ColCalculate
              disabled={!isValue}
              handleClick={() => prepCalculation("plus")}
            >
              +
            </ColCalculate>

            <ColButton value="0" appendValue={appendValue} span={6} />
            <ColButton
              value="."
              appendValue={appendValue}
              disabled={hasDecimal}
            />
            <ColCalculate
              disabled={!isValue || !isPreCalcValue}
              handleClick={() => {
                if (state.action) {
                  setState({
                    ...state,
                    value: calculate(
                      state.preCalc,
                      state.value,
                      state.action,
                    ).toString(),
                    preCalc: "",
                    action: "",
                  });
                }
              }}
            >
              =
            </ColCalculate>
          </Grid>
          <Button>Enter</Button>
        </Stack>
      </Modal>
    </>
  );
}
