"use client";

import { SWRConfig } from "swr";
import { PropsWithChildren } from "react";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export function Providers({ children }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 5 * 60 * 1000,
        revalidateOnFocus: false,
        errorRetryInterval: 3000,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
