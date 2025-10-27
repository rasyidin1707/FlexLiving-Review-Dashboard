"use client"

import * as React from "react";

export default function Sparkline({ points }: { points: Array<number | null> }) {
  const w = 120;
  const h = 36;
  const valid = points.filter((p): p is number => typeof p === "number");
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 10;
  const range = Math.max(1, max - min);
  const step = points.length > 1 ? w / (points.length - 1) : w;
  let d = "";
  points.forEach((p, i) => {
    const x = Math.round(i * step);
    const yVal = typeof p === "number" ? p : null;
    const yNorm = yVal == null ? null : (yVal - min) / range;
    const y = yNorm == null ? null : Math.round(h - yNorm * h);
    if (y == null) return;
    d += `${i === 0 ? "M" : "L"}${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label="Trend sparkline">
      <path d={d} fill="none" stroke="#6366F1" strokeWidth={2} />
    </svg>
  );
}

