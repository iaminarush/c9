import { initContract } from "@ts-rest/core";
import { categoryContract } from "./contract-category";
import { initQueryClient } from "@ts-rest/react-query";
import { env } from "~/env.mjs";

const c = initContract();

export const contract = c.router(
  {
    categories: categoryContract,
  },
  {
    // strictStatusCodes: true,
    // pathPrefix: "/api",
  }
);

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "/api"; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}/api`; // dev SSR should use localhost
};

export const client = initQueryClient(contract, {
  baseUrl: getBaseUrl(),
  // baseUrl: "",
  baseHeaders: {},
});
