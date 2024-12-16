import type { Metadata, Viewport } from "next";

import { Toaster } from "@/src/components/base/toaster";
import QueryProvider from "@/src/components/common/query-provider";
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
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
