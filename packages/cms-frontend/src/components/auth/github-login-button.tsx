"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";

import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/auth";

export function GitHubLoginButton() {
  const { handleGithubLogin } = useAuth();

  return (
    <Button
      className="w-full"
      onClick={handleGithubLogin}
    >
      <SiGithub className="mr-2 h-5 w-5" />
      GitHub 으로 로그인
    </Button>
  );
}
