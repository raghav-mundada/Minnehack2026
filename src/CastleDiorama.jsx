import React, { useMemo } from "react";
import "./styles/theme.css";

import c100 from "./assets/castle/castle_100.png";
import c75 from "./assets/castle/castle_75.png";
import c50 from "./assets/castle/castle_50.png";
import c25 from "./assets/castle/castle_25.png";
import c0 from "./assets/castle/castle_0.png";

const FRAMES = [
  { pct: 100, src: c100 },
  { pct: 75, src: c75 },
  { pct: 50, src: c50 },
  { pct: 25, src: c25 },
  { pct: 0, src: c0 },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function CastleDiorama({
  hp = 85,
  maxHp = 100,
  title = "Castle",
  subtitle = "",
}) {
  const pct = clamp(Math.round((hp / Math.max(1, maxHp)) * 100), 0, 100);

  const { lower, upper, blend } = useMemo(() => {
    // Ensure sorted high → low
    const frames = [...FRAMES].sort((a, b) => b.pct - a.pct);

    let lower = frames[0];
    let upper = frames[frames.length - 1];

    for (let i = 0; i < frames.length - 1; i++) {
      const current = frames[i];
      const next = frames[i + 1];

      if (pct <= current.pct && pct >= next.pct) {
        lower = current;
        upper = next;
        break;
      }
    }

    const range = Math.max(1, lower.pct - upper.pct);
    const blend = clamp((lower.pct - pct) / range, 0, 1);

    return { lower, upper, blend };
  }, [pct]);

  return (
    <div className="dioramaCard">
      <div className="dioramaTop">
        <div>
          <div className="dioramaTitle">{title}</div>
          {subtitle && <div className="muted">{subtitle}</div>}
        </div>
        <div className="pill">{pct}%</div>
      </div>

      <div className="dioramaFrame">
        <img
          className="dioramaImg"
          src={lower.src}
          alt={`castle ${lower.pct}%`}
          style={{ opacity: 1 }}
        />

        <img
          className="dioramaImg"
          src={upper.src}
          alt={`castle ${upper.pct}%`}
          style={{ opacity: blend }}
        />

        <div className="dioramaVignette" />
      </div>

      <div className="dioramaBottom">
        <div className="muted">Health</div>
        <div className="bar big">
          <div className="barFill" style={{ width: `${pct}%` }} />
        </div>
        <div className="tiny">
          {hp} / {maxHp}
        </div>
      </div>
    </div>
  );
}
