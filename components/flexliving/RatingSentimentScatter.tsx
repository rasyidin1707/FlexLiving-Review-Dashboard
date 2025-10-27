"use client"

import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { useIsDark } from "./useDarkMode";

type Point = { rating: number; sentiment: number };

export default function RatingSentimentScatter({ data }: { data: Point[] }) {
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={grid} />
        <XAxis type="number" dataKey="rating" name="Rating" domain={[0, 10]} tick={{ fontSize: 12, fill: axis }} />
        <YAxis type="number" dataKey="sentiment" name="Sentiment" domain={[-1, 1]} tick={{ fontSize: 12, fill: axis }} />
        <ZAxis type="number" dataKey={() => 100} range={[60, 60]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: '#e5e7eb' }} />
        <Scatter name="Reviews" data={data} fill="#6366F1" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
