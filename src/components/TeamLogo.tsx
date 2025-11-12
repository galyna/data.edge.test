"use client";

import { useState } from "react";
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
};

export const TeamLogo = ({ team, sport = "football", size = "md", className = "" }: TeamLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const logoUrl = getTeamLogo(team, sport);
  const sizePx = sizeMap[size];

  // If image failed to load or is emoji, show emoji fallback
  if (imageError || (!logoUrl.includes("http") && team.logo)) {
    const emojiSizeClass = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";
    return (
      <span className={`${emojiSizeClass} ${className}`}>
        {team.logo}
      </span>
    );
  }

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: sizePx, height: sizePx }}>
      {imageLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded"
          style={{ width: sizePx, height: sizePx }}
        />
      )}
      <Image
        src={logoUrl}
        alt={`${team.name} logo`}
        width={sizePx}
        height={sizePx}
        className={`object-contain ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => setImageLoading(false)}
        unoptimized
      />
    </div>
  );
};

