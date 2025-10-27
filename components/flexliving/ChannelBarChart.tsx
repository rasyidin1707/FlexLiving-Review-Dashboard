"use client"

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { Channel } from "./types";
import { useIsDark } from "./useDarkMode";

export default function ChannelBarChart({ data }: { data: Array<{ channel: Channel; count: number }> }) {
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const tooltipColor = dark ? "#E5E7EB" : "#111827";
  const labelColor = axis;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="channel" tick={{ fontSize: 12, fill: labelColor }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: labelColor }} />
        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor }} />
        <Bar dataKey="count" fill="#06B6D4" />
      </BarChart>
    </ResponsiveContainer>
  );
}
