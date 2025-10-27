"use client"

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useIsDark } from "./useDarkMode";

export default function AverageRatingLineChart({ data }: { data: Array<{ month: string; avg: number | null }> }) {
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const tooltipColor = dark ? "#E5E7EB" : "#111827";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: axis }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: axis }} />
        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor }} />
        <Line type="monotone" dataKey="avg" stroke="#6366F1" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
