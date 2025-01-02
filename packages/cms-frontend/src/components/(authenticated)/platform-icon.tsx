import {
  SiAndroid,
  SiEpicgames,
  SiGogdotcom,
  SiSteam,
} from "@icons-pack/react-simple-icons";
import type { GetArtworks200ResponseItemsInnerPlayedOnEnum as Platform } from "@minhoyunlife/my-ts-client";
import { Gamepad2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/base/tooltip";
import { cn } from "@/src/lib/utils/tailwindcss/utils";

function NintendoSwitchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      fill="currentColor"
      {...props}
    >
      <path d="M10.04 20.4H7.12c-.93 0-1.82-.4-2.48-1.04C4 18.7 3.6 17.81 3.6 16.88V7.12c0-.93.4-1.82 1.04-2.48C5.3 4 6.19 3.62 7.12 3.62h2.92zM7.12 2A5.12 5.12 0 0 0 2 7.12v9.76C2 19.71 4.29 22 7.12 22h4.53V2zM5.11 8c0 1.04.84 1.88 1.89 1.88c1.03 0 1.87-.84 1.87-1.88S8.03 6.12 7 6.12c-1.05 0-1.89.84-1.89 1.88m12.5 3c1.11 0 2.01.89 2.01 2c0 1.12-.9 2-2.01 2c-1.11 0-2.03-.88-2.03-2c0-1.11.92-2 2.03-2m-.73 11A5.12 5.12 0 0 0 22 16.88V7.12C22 4.29 19.71 2 16.88 2h-3.23v20z" />
    </svg>
  );
}

interface PlatformIconProps {
  platform: Platform | undefined;
  className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const getIcon = () => {
    switch (platform) {
      case "Steam":
        return (
          <SiSteam
            data-testid="platform-steam-icon"
            className={cn(className, "text-[#1b2838] hover:text-[#66c0f4]")}
          />
        );
      case "Switch":
        return (
          <NintendoSwitchIcon
            data-testid="platform-switch-icon"
            className={cn(className, "text-[#e60012] hover:text-[#ff1a1a83]")}
          />
        );
      case "GOG":
        return (
          <SiGogdotcom
            data-testid="platform-gog-icon"
            className={cn(
              className,
              "text-[#86198f] hover:text-white hover:bg-[#86198f]",
            )}
          />
        );
      case "Epic Games":
        return (
          <SiEpicgames
            data-testid="platform-epic-icon"
            className={cn(className, "text-black hover:text-[#7b7b7b]")}
          />
        );
      case "Android":
        return (
          <SiAndroid
            data-testid="platform-android-icon"
            className={cn(className, "text-[#3ddc84] hover:text-[#32b36c]")}
          />
        );
      default:
        return (
          <Gamepad2
            data-testid="platform-others-icon"
            className={className}
          />
        );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center">{getIcon()}</div>
        </TooltipTrigger>
        <TooltipContent className="bg-white text-black border">
          <p>{platform || "Others"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
