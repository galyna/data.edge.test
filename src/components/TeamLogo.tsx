"use client";

import { useState, memo, useMemo, useCallback } from "react";
import { Team } from "@/types/match";
import Image from "next/image";

interface TeamLogoProps {
  team: Team;
  sport?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64,
} as const;

export const TeamLogo = memo(({
  team,
  sport = "football",
  size = "md",
  className = "",
}: TeamLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Logo URL is already calculated in useLiveSportsData via teamLogos.ts
  const logoUrl = team.logo;
  const sizePx = sizeMap[size];
  
  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);
  
  const handleLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Fallback to initials if no URL or error
  if (imageError || !logoUrl || !logoUrl.startsWith("http")) {
    const initials = team.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const fontSize = size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-sm";
    
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-muted border border-border ${fontSize} font-bold text-muted-foreground ${className}`}
        style={{ width: sizePx, height: sizePx }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {imageLoading && (
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-muted"
          style={{ width: sizePx, height: sizePx }}
        />
      )}
      <Image
        src={logoUrl}
        alt={`${team.name} logo`}
        width={sizePx}
        height={sizePx}
        className={`object-contain ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized
      />
    </div>
  );
});

TeamLogo.displayName = "TeamLogo";
