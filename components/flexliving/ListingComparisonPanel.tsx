"use client"

import * as React from "react";
import type { ListingSummary, RatingItems } from "./types";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";
import { useIsDark } from "./useDarkMode";

export default function ListingComparisonPanel({ listingA, listingB, averagesA, averagesB }: {
  listingA: ListingSummary;
  listingB: ListingSummary;
  averagesA: RatingItems;
  averagesB: RatingItems;
}) {
  const categories = Array.from(new Set([...(Object.keys(averagesA||{})), ...(Object.keys(averagesB||{}))]));
  const data = categories.map((c) => ({ category: c, a: (averagesA as any)?.[c] ?? 0, b: (averagesB as any)?.[c] ?? 0 }));
  const dark = useIsDark();
  const axis = dark ? "#9CA3AF" : "#6B7280";
  const grid = dark ? "#1F2937" : "#E5E7EB";
  const tooltipBg = dark ? "#111827" : "#ffffff";
  const tooltipBorder = dark ? "#374151" : "#E5E7EB";
  const [showA, setShowA] = React.useState(true);
  const [showB, setShowB] = React.useState(true);

  // Initialize from URL (cmp param) or localStorage, then persist on change
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const cmp = url.searchParams.get('cmp');
      const ls = localStorage.getItem('flex:cmp');
      const src = cmp || ls || 'ab';
      if (src === 'a') { setShowA(true); setShowB(false); }
      else if (src === 'b') { setShowA(false); setShowB(true); }
      else if (src === 'none') { setShowA(false); setShowB(false); }
      else { setShowA(true); setShowB(true); }
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      const code = showA && showB ? 'ab' : showA ? 'a' : showB ? 'b' : 'none';
      localStorage.setItem('flex:cmp', code);
      const url = new URL(window.location.href);
      if (code === 'ab') url.searchParams.delete('cmp'); else url.searchParams.set('cmp', code);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [showA, showB]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 dark:text-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Listing Comparison</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{listingA.name} vs {listingB.name}</div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={90}>
            <PolarGrid stroke={grid} />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: axis }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: axis }} />
            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, color: '#e5e7eb' }} />
            {showA ? <Radar name={listingA.name} dataKey="a" stroke="#6366F1" strokeWidth={2} fill="rgba(99,102,241,0.35)" /> : null}
            {showB ? <Radar name={listingB.name} dataKey="b" stroke="#06B6D4" strokeWidth={2} fill="rgba(6,182,212,0.35)" /> : null}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowA((v) => !v)}
          aria-pressed={showA}
          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition-colors ${showA ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#6366F1' }} /> {listingA.name}
        </button>
        <button
          type="button"
          onClick={() => setShowB((v) => !v)}
          aria-pressed={showB}
          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium transition-colors ${showB ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} /> {listingB.name}
        </button>
        <button
          type="button"
          onClick={() => { setShowA(true); setShowB(true); }}
          className="ml-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Reset comparison"
          title="Reset comparison"
        >
          Reset
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-700 dark:text-gray-100">
        <div>Avg (all): <span className="font-medium">{listingA.avgAll ?? "-"}</span> vs <span className="font-medium">{listingB.avgAll ?? "-"}</span></div>
        <div>Avg (approved): <span className="font-medium">{listingA.avgApproved ?? "-"}</span> vs <span className="font-medium">{listingB.avgApproved ?? "-"}</span></div>
      </div>
    </div>
  );
}
