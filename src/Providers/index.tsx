"use client";

import { MantineProvider } from "@mantine/core";
import { ReactNode, useState } from "react";
import { mantineTheme } from "./theme";
import NavLayout from "./NavLayout";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "@/contracts/contract";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 3 } },
      })
  );

  return (
    <SessionProvider>
      <MantineProvider theme={mantineTheme}>
        <QueryClientProvider client={queryClient}>
          <NavLayout>{children}</NavLayout>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
