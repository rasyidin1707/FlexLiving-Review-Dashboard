"use client"

import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useIsDark } from "./useDarkMode";

type Point = { month: string; positive: number; neutral: number; negative: number };

export default function SentimentTrendChart({ data }: { data: Point[] }) {
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const tooltipColor = dark ? "#E5E7EB" : "#111827";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axis }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: axis }} />
        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor }} />
        <Legend wrapperStyle={{ color: dark ? '#e5e7eb' : '#111827' }} />
        <Area type="monotone" dataKey="positive" name="Positive %" stroke="#10B981" fill="rgba(16,185,129,0.25)" />
        <Area type="monotone" dataKey="neutral" name="Neutral %" stroke="#F59E0B" fill="rgba(245,158,11,0.25)" />
        <Area type="monotone" dataKey="negative" name="Negative %" stroke="#EF4444" fill="rgba(239,68,68,0.25)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
