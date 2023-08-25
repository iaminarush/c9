"use client";
import { createTheme } from "@mantine/core";

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
});
