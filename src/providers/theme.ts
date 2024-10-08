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
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const mantineTheme = createTheme({
  fontFamily: inter.style.fontFamily,
  headings: { fontFamily: inter.style.fontFamily },
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
