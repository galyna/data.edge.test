"use client";

import { useState, memo, useMemo, useCallback } from "react";
import { Team } from "@/types/match";
import { getTeamLogo } from "@/lib/teamLogos";
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

  // Memoize logo URL to avoid recalculation
  const logoUrl = useMemo(() => getTeamLogo(team, sport), [team, sport]);
  const sizePx = sizeMap[size];
  
  // Memoize callbacks
  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);
  
  const handleLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // If image failed to load or is emoji, show emoji fallback
  if (imageError || (!logoUrl.includes("http") && team.logo)) {
    const emojiSizeClass = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";
    return <span className={`${emojiSizeClass} ${className}`}>{team.logo}</span>;
  }

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {imageLoading && (
        <div
          className="absolute inset-0 animate-pulse rounded bg-muted"
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
        priority={size === "lg" || size === "xl"} // Priority for larger logos
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.team.name === nextProps.team.name &&
    prevProps.team.logo === nextProps.team.logo &&
    prevProps.sport === nextProps.sport &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});

TeamLogo.displayName = "TeamLogo";
