import { MantineProvider } from "@mantine/core";
import { ReactNode } from "react";
import { mantineTheme } from "./theme";
import NavLayout from "./NavLayout";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <NavLayout>{children}</NavLayout>
    </MantineProvider>
  );
}
