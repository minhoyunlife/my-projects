"use client";

import { LogOut } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/base/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/base/sidebar";
import { useAuth } from "@/src/hooks/use-auth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { logout } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-3 p-2">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
            />
            <AvatarFallback className="rounded-lg">
              {user.name[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {user.email}
            </span>
          </div>

          <SidebarMenuButton
            size="sm"
            onClick={logout}
            className="h-8 w-8 shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
