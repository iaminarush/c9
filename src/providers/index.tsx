"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import NavLayout from "./NavLayout";
import ToastProvider from "./ToastProvider";
import { queryClientOptions } from "./queryClient";
import { mantineTheme } from "./theme";
import { RouterTransition } from "@/components/util/RouterTransition";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <SessionProvider>
      <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
        <QueryClientProvider client={queryClient}>
          <RouterTransition />
          <NavLayout>{children}</NavLayout>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          <ToastProvider />
        </QueryClientProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
