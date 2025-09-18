import { AppRoutes } from "./routes-config";

export const config = {
  currency: "$",
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  EHR_URL: process.env.NEXT_PUBLIC_MINIMAL_EHR_URL,
  ehrToken: `${process.env.EHR_AUTH_KEY}`,
};
