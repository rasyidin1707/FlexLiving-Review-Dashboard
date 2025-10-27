"use client"

import * as React from "react";

type Keyword = { term: string; count: number };

export default function KeywordCloud({ keywords }: { keywords: Keyword[] }) {
  const max = Math.max(1, ...keywords.map((k) => k.count));
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((k, i) => {
        const scale = 0.8 + (k.count / max) * 0.7; // 0.8–1.5
        return (
          <span
            key={`${k.term}-${i}`}
            className="rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 text-xs font-medium inline-block"
            title={`${k.term} (${k.count})`}
            style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}
          >
            {k.term}
          </span>
        );
      })}
    </div>
  );
}
