"use client";

import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/use-auth";

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <>
      <h1>대시보드</h1>
      <Button onClick={logout}>로그아웃</Button>
    </>
  );
}
