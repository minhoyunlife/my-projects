import * as React from "react";

import Link from "next/link";

import { NavUser } from "@/src/components/(authenticated)/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/src/components/base/sidebar";
import { Logo } from "@/src/components/common/logo";
import { menu } from "@/src/constants/nav/menu";
import { ROUTES } from "@/src/routes";

export function NavSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarRail />
      <SidebarHeader>
        <Link href={ROUTES.DASHBOARD}>
          <h1 className="flex items-center gap-2">
            <Logo />
            <span className="sr-only">MY Project CMS</span>
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menu.groups.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>{item.name}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
