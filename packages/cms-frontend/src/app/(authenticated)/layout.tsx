import { NavSidebar } from "@/src/components/(authenticated)/nav-sidebar/nav-sidebar";
import { SidebarInset, SidebarProvider } from "@/src/components/base/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <NavSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
