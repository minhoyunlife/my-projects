import type { Metadata } from "next";

import QueryProvider from "@/src/components/query-provider";

import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "MY Project CMS",
  description: "Content Management System for MY Project",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background">
        <QueryProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
