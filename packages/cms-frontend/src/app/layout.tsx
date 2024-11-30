import type { Metadata, Viewport } from "next";

import QueryProvider from "@/src/components/query-provider";

import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "MY Project CMS",
  description: "Content Management System for MY Project",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background antialiased">
        <QueryProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
