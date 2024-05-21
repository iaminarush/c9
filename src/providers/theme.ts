// "use client";
import {
  ActionIcon,
  Button,
  NumberInput,
  Select,
  Skeleton,
  TextInput,
  createTheme,
} from "@mantine/core";

const fontFamily = [
  "Inter",
  "Open Sans",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
].join(",");

export const mantineTheme = createTheme({
  fontFamily,
  components: {
    Button: Button.extend({
      defaultProps: {
        variant: "default",
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: "default",
      },
    }),
    Skeleton: Skeleton.extend({
      defaultProps: {
        h: 250,
      },
    }),
    TextInput: TextInput.extend({
      styles: {
        input: {
          fontSize: 16,
        },
      },
    }),
    Select: Select.extend({
      styles: {
        input: {
          fontSize: 16,
        },
      },
    }),
    NumberInput: NumberInput.extend({
      styles: {
        input: {
          fontSize: 16,
        },
      },
    }),
  },
});
