"use client";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const RouterTransition = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nprogress.complete();
    return () => {
      nprogress.start();
    };
  }, [pathname, searchParams]);

  // useEffect(() => {
  //   setTimeout(() => nprogress.complete(), 1000);
  //   return () => {
  //     nprogress.start();
  //   };
  // }, [pathname, searchParams]);

  return <NavigationProgress size={5} />;
};
