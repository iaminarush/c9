import {
  ActionIcon,
  Button,
  Grid,
  GridCol,
  GridColProps,
  Group,
  Modal,
  NumberFormatter,
  Stack
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBackspace, IconCalculator } from "@tabler/icons-react";
import { useCallback, useState } from "react";

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

const getSymbol = (action: Action | "") => {
  switch (action) {
    case "divide":
      return "÷";
    case "minus":
      return "−";
    case "plus":
      return "+";
    case "times":
      return "×";
    default:
      return "";
  }
};

export default function CalculatorInput({
  onEnter,
}: {
  onEnter: (value: number) => void;
}) {
  const [opened, handlers] = useDisclosure();
  const [state, setState] = useState<State>({
    value: "",
    preCalc: "",
    action: "",
  });

  const appendValue = (value: string) => {
    console.log("append", state);
    if (state.action && state.preCalc && !state.value) {
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
  const noValues = !isValue && !isPreCalcValue;

  return (
    <>
      <ActionIcon onClick={handlers.open}>
        <IconCalculator />
      </ActionIcon>
      <Modal opened={opened} onClose={handleClose} centered>
        <Stack>
          <Stack align="flex-end" gap={8}>
            <Group h={24.8} gap={4}>
              <NumberFormatter
                value={state.preCalc}
                thousandSeparator
                suffix={
                  state.action ? ` ${getSymbol(state.action)}` : undefined
                }
              />
            </Group>
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
            <GridCol span={3} offset={3}>
              <Button
                w="100%"
                disabled={!isValue}
                onClick={() =>
                  setState({ ...state, value: state.value.slice(0, -1) })
                }
              >
                <IconBackspace />
              </Button>
            </GridCol>
            <ColCalculate
              disabled={noValues}
              handleClick={() => prepCalculation("divide")}
            >
              ÷
            </ColCalculate>

            <ColButton value="7" appendValue={appendValue} />
            <ColButton value="8" appendValue={appendValue} />
            <ColButton value="9" appendValue={appendValue} />
            <ColCalculate
              disabled={noValues}
              handleClick={() => prepCalculation("times")}
            >
              ×
            </ColCalculate>

            <ColButton value="4" appendValue={appendValue} />
            <ColButton value="5" appendValue={appendValue} />
            <ColButton value="6" appendValue={appendValue} />
            <ColCalculate
              disabled={noValues}
              handleClick={() => prepCalculation("minus")}
            >
              −
            </ColCalculate>

            <ColButton value="1" appendValue={appendValue} />
            <ColButton value="2" appendValue={appendValue} />
            <ColButton value="3" appendValue={appendValue} />
            <ColCalculate
              disabled={noValues}
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
          <Button
            disabled={!isValue}
            onClick={() => {
              const value = state.value;
              onEnter(Number(value));
              handleClose();
            }}
          >
            Enter
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

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
