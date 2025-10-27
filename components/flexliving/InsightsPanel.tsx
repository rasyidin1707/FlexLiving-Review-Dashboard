"use client"

import * as React from "react";
import { motion } from "framer-motion";
import RadarInsightsChart from "./RadarInsightsChart";
import SentimentTrendChart from "./SentimentTrendChart";
import KeywordCloud from "./KeywordCloud";
import type { RatingItems } from "./types";

export type InsightsPanelProps = {
  topIssues: string[];
  topIssueTrends?: Record<string, number[]>;
  keywords: Array<{ term: string; count: number }>;
  sentiment: { positive: number; neutral: number; negative: number };
  sentimentHistory?: Array<{ month: string; positive: number; neutral: number; negative: number }>;
  categoryAverages: RatingItems;
};

export default function InsightsPanel({ topIssues, topIssueTrends, keywords, sentiment, sentimentHistory, categoryAverages }: InsightsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
    >
      <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Top Issues</div>
          <ul className="text-sm text-gray-700 dark:text-gray-100 space-y-2">
            {topIssues.length === 0 ? <li>No issues detected</li> : null}
            {topIssues.map((i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>{i}</span>
                <MiniBars series={(topIssueTrends?.[i] || []).slice(-6)} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Most Mentioned</div>
          <KeywordCloud keywords={keywords} />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Sentiment & Categories</div>
          <RadarInsightsChart averages={categoryAverages} />
          <div className="mt-2 text-sm">
            <span className="text-green-500 font-medium">{sentiment.positive}% positive</span>
            <span className="text-gray-400"> · </span>
            <span className="text-yellow-500 font-medium">{sentiment.neutral}% neutral</span>
            <span className="text-gray-400"> · </span>
            <span className="text-red-500 font-medium">{sentiment.negative}% negative</span>
          </div>
          {sentimentHistory && sentimentHistory.length > 0 ? (
            <div className="h-40 mt-3">
              <SentimentTrendChart data={sentimentHistory} />
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function MiniBars({ series }: { series: number[] }) {
  if (!series || series.length === 0) return null;
  const max = Math.max(1, ...series);
  return (
    <div className="flex items-end gap-1 h-6">
      {series.map((v, i) => (
        <div key={i} className="w-1.5 bg-indigo-500" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}
