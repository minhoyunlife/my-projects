"use client";

import { useState } from "react";

import { SiGithub } from "@icons-pack/react-simple-icons";

import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { useAuth } from "@/src/hooks/use-auth";

export function GitHubLoginButton() {
  const { loginByGithub } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (isLoading) return;

    setIsLoading(true);
    loginByGithub();
  };

  return (
    <Button
      className="w-full focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-500"
      aria-label="github login"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <SiGithub
            data-testid="github-icon"
            className="mr-2 h-5 w-5"
            aria-hidden="true"
          />
          GitHub 으로 로그인
        </>
      )}
    </Button>
  );
}
