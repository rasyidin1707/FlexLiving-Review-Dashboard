"use client"

import * as React from "react";

export default function IssuesKeywordsPanel({
  topIssues,
  keywords,
  topIssueCounts,
  onKeywordClick,
  onIssueClick,
}: {
  topIssues: string[];
  keywords: Array<{ term: string; count: number }>;
  topIssueCounts?: Record<string, number>;
  onKeywordClick?: (term: string) => void;
  onIssueClick?: (category: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Top Issues</div>
          <ul className="text-sm text-gray-700 dark:text-gray-100 space-y-1">
            {topIssues.length === 0 ? <li>None detected</li> : null}
            {topIssues.map((i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onIssueClick?.(i)}
                  className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label={`Filter by category ${i}`}
                >
                  <span>{i}</span>
                  {topIssueCounts && typeof topIssueCounts[i] === 'number' ? (
                    <span className="text-[10px] rounded-full bg-white/80 dark:bg-gray-800 px-1.5 py-0.5">{topIssueCounts[i]}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Most Mentioned</div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <button
                key={k.term}
                type="button"
                onClick={() => onKeywordClick?.(k.term)}
                className="rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`${k.term} (${k.count})`}
                aria-label={`Filter by keyword ${k.term}`}
              >
                {k.term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
