"use client";

import { Separator } from "@/src/components/base/separator";
import { SidebarTrigger } from "@/src/components/base/sidebar";

type PageWrapperProps = {
  children: React.ReactNode;
  title: string;
};

export function PageWrapper({ children, title }: PageWrapperProps) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h2>
      </header>
      <div className="relative flex flex-1 flex-col gap-4 p-4">{children}</div>
    </>
  );
}
