"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { CommandPalette } from "@/components/cmdk/CommandPalette";
import { Cheatsheet } from "@/components/cmdk/Cheatsheet";

function GlobalLayer({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  const { paletteOpen, setPaletteOpen, cheatsheetOpen, setCheatsheetOpen } =
    useGlobalShortcuts();
  return (
    <>
      {children}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Cheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
    </>
  );
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
        <GlobalLayer>{children}</GlobalLayer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
