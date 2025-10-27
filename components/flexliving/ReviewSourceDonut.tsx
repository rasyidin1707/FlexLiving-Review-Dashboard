"use client"

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Channel } from "./types";
import { useIsDark } from "./useDarkMode";

const COLORS = ["#06B6D4", "#6366F1", "#10B981", "#F59E0B", "#EF4444"];

export default function ReviewSourceDonut({ data, onSelect, selected }: { data: Array<{ channel: Channel; count: number }>; onSelect?: (ch: Channel) => void; selected?: Channel[] }) {
  const dark = useIsDark();
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const tooltipColor = dark ? "#E5E7EB" : "#111827";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="channel"
          cx="50%"
          cy="45%"
          innerRadius={56}
          outerRadius={86}
          onClick={(seg) => { if (onSelect && seg?.name) onSelect(seg.name as Channel); }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={selected && selected.length ? (selected.includes(entry.channel) ? 1 : 0.35) : 1}
              cursor={onSelect ? 'pointer' : 'default'}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor }} />
        <Legend content={(props) => <ClickableLegend {...props} onSelect={onSelect} selected={selected} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ClickableLegend({ payload, onSelect, selected }: any) {
  if (!payload) return null;
  const hexToRgba = (hex: string, a = 1) => {
    try {
      const h = hex.replace('#','');
      const r = parseInt(h.substring(0,2), 16);
      const g = parseInt(h.substring(2,4), 16);
      const b = parseInt(h.substring(4,6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } catch { return hex; }
  };
  return (
    <ul style={{ display: 'flex', gap: 8, justifyContent: 'center', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
      {payload.map((item: any, idx: number) => {
        const ch = item.value as Channel;
        const color = item.color as string;
        // Try to read the count from payload; recharts Pie legend attaches the slice as item.payload
        const count = (item && item.payload && (item.payload.value ?? item.payload.count)) ?? undefined;
        const active = !selected || selected.length === 0 || selected.includes(ch);
        const bg = hexToRgba(color, active ? 0.18 : 0.08);
        const border = hexToRgba(color, 0.35);
        return (
          <li key={idx}>
            <button
              type="button"
              onClick={() => onSelect?.(ch)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
                background: bg,
                border: `1px solid ${border}`,
                padding: '1px 6px', borderRadius: 9999, cursor: 'pointer', opacity: active ? 1 : 0.6,
              }}
              aria-pressed={active}
              aria-label={`Toggle channel ${ch}`}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              <span>
                {ch}
                {typeof count === 'number' ? ` · ${count}` : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
