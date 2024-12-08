"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// NOTE: 향후 기능이 추가될 떄 리팩터링이 필요할 가능성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
