import { cn } from "@/lib/utils";

interface ZombieProps {
  type?: "regular" | "nudge";
  isAttacking?: boolean;
  className?: string;
}

export function Zombie({ type = "regular", isAttacking = false, className }: ZombieProps) {
  const zombieColor = type === "nudge" 
    ? "var(--zombie-nudge)" 
    : "var(--zombie-regular)";
  
  const animationClass = isAttacking ? "zombie-attacking" : "zombie-walking";
  
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn(animationClass, className)}
      style={{ width: "60px", height: "72px" }}
    >
      {/* Zombie body */}
      <ellipse
        cx="50"
        cy="80"
        rx="20"
        ry="30"
        fill={zombieColor}
        opacity="0.9"
      />
      
      {/* Zombie head */}
      <circle
        cx="50"
        cy="40"
        r="22"
        fill={zombieColor}
        opacity="0.95"
      />
      
      {/* Eyes */}
      <circle cx="42" cy="38" r="4" fill="#1a1a1a" />
      <circle cx="58" cy="38" r="4" fill="#1a1a1a" />
      <circle cx="43" cy="37" r="1.5" fill="#fff" opacity="0.6" />
      <circle cx="59" cy="37" r="1.5" fill="#fff" opacity="0.6" />
      
      {/* Mouth */}
      <path
        d="M 42 48 Q 50 52 58 48"
        stroke="#1a1a1a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Arms */}
      <rect
        x="25"
        y="70"
        width="8"
        height="25"
        rx="4"
        fill={zombieColor}
        opacity="0.85"
        transform="rotate(-20 29 70)"
      />
      <rect
        x="67"
        y="70"
        width="8"
        height="25"
        rx="4"
        fill={zombieColor}
        opacity="0.85"
        transform="rotate(20 71 70)"
      />
      
      {/* Legs */}
      <rect
        x="42"
        y="105"
        width="7"
        height="12"
        rx="3"
        fill={zombieColor}
        opacity="0.8"
      />
      <rect
        x="51"
        y="105"
        width="7"
        height="12"
        rx="3"
        fill={zombieColor}
        opacity="0.8"
      />
      
      {/* Tattered clothes effect */}
      <path
        d="M 35 75 L 32 85 L 35 90"
        stroke={zombieColor}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 65 75 L 68 85 L 65 90"
        stroke={zombieColor}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      
      {type === "nudge" && (
        <>
          {/* Special indicator for nudge zombies - glowing aura */}
          <circle
            cx="50"
            cy="40"
            r="26"
            fill="none"
            stroke={zombieColor}
            strokeWidth="2"
            opacity="0.4"
          />
          <circle
            cx="50"
            cy="40"
            r="30"
            fill="none"
            stroke={zombieColor}
            strokeWidth="1"
            opacity="0.2"
          />
        </>
      )}
    </svg>
  );
}
