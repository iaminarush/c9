"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import NavLayout from "./NavLayout";
import { mantineTheme } from "./theme";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 3 } },
      })
  );

  return (
    <SessionProvider>
      <MantineProvider
      // theme={mantineTheme}
      >
        <QueryClientProvider client={queryClient}>
          <NavLayout>{children}</NavLayout>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
