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
import { ROUTES } from "@/src/constants/routes";

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  }, // TODO: 인증 후, 유저 정보를 묘화할 수단이 필요
  navMain: [
    {
      title: "🏞️ 팬아트",
      items: [
        {
          title: "작품 목록",
          url: ROUTES.FANARTS,
        },
        {
          title: "장르 목록",
          url: ROUTES.GENRES,
        },
      ],
    },
  ],
};

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
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
