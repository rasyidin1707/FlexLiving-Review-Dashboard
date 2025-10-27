"use client"

import * as React from "react";
import Sparkline from "./Sparkline";
import type { ListingSummary } from "./types";

export default function ListingCard({ data, onClick }: { data: ListingSummary; onClick?: (id: string) => void }) {
  const points = (data.monthlySeries || []).map((m) => m.avg ?? null);
  return (
    <button
      onClick={() => onClick?.(data.id)}
      className="text-left bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all duration-150 ease-out hover:shadow-md hover:scale-[1.01] w-full dark:text-gray-100"
      aria-label={`Open listing ${data.name}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{data.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{data.total} total / {data.approved} approved</div>
      </div>
      <div className="mt-1 text-sm text-gray-700 dark:text-gray-100">
        Avg (all): <span className="font-medium">{data.avgAll ?? "-"}</span>
        <span className="text-gray-400"> · </span>
        Avg (approved): <span className="font-medium">{data.avgApproved ?? "-"}</span>
      </div>
      <div className="mt-3">
        <Sparkline points={points} />
      </div>
    </button>
  );
}
