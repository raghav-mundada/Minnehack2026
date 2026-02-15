import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CastleProps {
  health: number; // 0-100
  isShaking?: boolean;
  className?: string;
}

export function Castle({ health, isShaking = false, className }: CastleProps) {
  const [isCrumbling, setIsCrumbling] = useState(false);
  
  useEffect(() => {
    if (health === 0) {
      setIsCrumbling(true);
    } else {
      setIsCrumbling(false);
    }
  }, [health]);
  
  // Determine castle color based on health
  const getCastleColor = () => {
    if (health > 60) return "var(--castle-healthy)";
    if (health > 30) return "var(--castle-damaged)";
    return "var(--castle-broken)";
  };
  
  const castleColor = getCastleColor();
  const damageOpacity = Math.max(0.3, health / 100);
  
  const animationClass = cn({
    "castle-shaking": isShaking && health > 0,
    "castle-crumbling": isCrumbling,
  });
  
  return (
    <svg
      viewBox="0 0 200 180"
      className={cn(animationClass, className)}
      style={{ width: "200px", height: "180px" }}
    >
      {/* Castle base */}
      <rect
        x="40"
        y="100"
        width="120"
        height="70"
        fill={castleColor}
        opacity={damageOpacity}
        stroke="#3a2817"
        strokeWidth="2"
      />
      
      {/* Left tower */}
      <rect
        x="30"
        y="60"
        width="35"
        height="110"
        fill={castleColor}
        opacity={damageOpacity}
        stroke="#3a2817"
        strokeWidth="2"
      />
      
      {/* Right tower */}
      <rect
        x="135"
        y="60"
        width="35"
        height="110"
        fill={castleColor}
        opacity={damageOpacity}
        stroke="#3a2817"
        strokeWidth="2"
      />
      
      {/* Center tower */}
      <rect
        x="75"
        y="40"
        width="50"
        height="130"
        fill={castleColor}
        opacity={damageOpacity}
        stroke="#3a2817"
        strokeWidth="2"
      />
      
      {/* Battlements - left tower */}
      <rect x="30" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="45" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="57" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      
      {/* Battlements - right tower */}
      <rect x="135" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="150" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="162" y="55" width="8" height="10" fill={castleColor} opacity={damageOpacity} />
      
      {/* Battlements - center tower */}
      <rect x="75" y="35" width="10" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="95" y="35" width="10" height="10" fill={castleColor} opacity={damageOpacity} />
      <rect x="115" y="35" width="10" height="10" fill={castleColor} opacity={damageOpacity} />
      
      {/* Windows - left tower */}
      <rect x="40" y="80" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      <rect x="40" y="120" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      
      {/* Windows - right tower */}
      <rect x="145" y="80" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      <rect x="145" y="120" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      
      {/* Windows - center tower */}
      <rect x="85" y="60" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      <rect x="105" y="60" width="15" height="20" fill="#1a1a1a" opacity={damageOpacity * 0.6} rx="2" />
      
      {/* Main gate */}
      <path
        d="M 85 140 Q 85 120 100 120 Q 115 120 115 140 L 115 170 L 85 170 Z"
        fill="#2a1810"
        opacity={damageOpacity}
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      
      {/* Gate details */}
      <line x1="100" y1="130" x2="100" y2="170" stroke="#1a1a1a" strokeWidth="1" opacity={damageOpacity * 0.5} />
      <circle cx="95" cy="145" r="2" fill="#4a3820" opacity={damageOpacity} />
      
      {/* Damage cracks - appear as health decreases */}
      {health < 80 && (
        <>
          <path
            d="M 50 90 L 55 100 L 52 110"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 150 95 L 148 105 L 152 115"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        </>
      )}
      
      {health < 50 && (
        <>
          <path
            d="M 90 70 L 85 80 L 90 90"
            stroke="#1a1a1a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 110 75 L 115 85 L 112 95"
            stroke="#1a1a1a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 70 130 L 65 140 L 68 150"
            stroke="#1a1a1a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        </>
      )}
      
      {health < 30 && (
        <>
          <path
            d="M 45 70 L 42 85 L 48 95"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 155 75 L 158 90 L 153 100"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 100 50 L 95 60 L 100 70"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            fill="none"
            opacity="0.8"
          />
        </>
      )}
      
      {/* Rubble at base when heavily damaged */}
      {health < 20 && (
        <>
          <ellipse cx="50" cy="170" rx="8" ry="4" fill="#3a2817" opacity="0.5" />
          <ellipse cx="150" cy="170" rx="8" ry="4" fill="#3a2817" opacity="0.5" />
          <ellipse cx="100" cy="172" rx="10" ry="5" fill="#3a2817" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
