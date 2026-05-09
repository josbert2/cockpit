"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

function RealtimeBridge({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={client}>
        <RealtimeBridge>{children}</RealtimeBridge>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
