"use client"

import * as React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { RatingItems } from "./types";
import { useIsDark } from "./useDarkMode";

export default function RadarInsightsChart({ averages }: { averages: RatingItems }) {
  const entries = Object.entries(averages || {});
  const data = entries.map(([k, v]) => ({ category: k, score: v ?? 0 }));
  const hasData = data.length > 0 && data.some((d) => (d.score ?? 0) > 0);
  return (
    <div className="relative h-full min-h-[220px]">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadarInner data={data} />
        </ResponsiveContainer>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
          No category data for current filters
        </div>
      )}
    </div>
  );
}

function RadarInner({ data }: { data: Array<{ category: string; score: number }> }) {
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const tooltipColor = dark ? "#E5E7EB" : "#111827";
  return (
    <RadarChart data={data} outerRadius={90}>
      <PolarGrid stroke={grid} />
      <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: axis }} />
      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: axis }} />
      <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor }} />
      <Radar name="Avg" dataKey="score" stroke="#6366F1" fill="rgba(99,102,241,0.4)" />
    </RadarChart>
  );
}
