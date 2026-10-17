"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface ProviderProps {
  children: React.ReactNode;
}

function initializeQueryClient() {
  return new QueryClient();
}

export default function Provider({ children }: ProviderProps) {
  const [queryClient] = useState<QueryClient>(initializeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
