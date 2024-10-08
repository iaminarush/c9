import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/dates/styles.css";
import "@uploadthing/react/styles.css";

import Providers from "@/providers";
import { ColorSchemeScript } from "@mantine/core";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "C9",
  description: "C9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
