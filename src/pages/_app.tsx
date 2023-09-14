import { MantineProvider } from "@mantine/core";
import type { AppProps } from "next/app";
import { mantineTheme } from "@/providers/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Component {...pageProps} />
    </MantineProvider>
  );
}
