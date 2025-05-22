"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

export default function QueryProvider({ children }: { children: ReactNode }) {
  // This ensures that data is not shared between different users and requests,
  // while still only creating the QueryClient once per component lifecycle
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
