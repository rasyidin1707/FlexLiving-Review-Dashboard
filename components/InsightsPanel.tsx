"use client"

import { useMemo } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

type InsightsData = {
  topIssues: string[]
  keywordFrequency: Record<string, number>
  sentimentStats: { positive: number; neutral: number; negative: number }
  categoryAverages: Record<string, number>
} | null

export function InsightsPanel({ data }: { data: InsightsData }) {
  const radarData = useMemo(
    () =>
      data
        ? Object.entries(data.categoryAverages).map(([k, v]) => ({ category: k, avg: v }))
        : [],
    [data],
  )

  return (
    <div className="card bg-white">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-800">Insights</div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <div className="text-sm font-medium">Top issues</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {!data || data.topIssues.length === 0 ? (
              <li className="text-muted-foreground">None detected</li>
            ) : (
              data.topIssues.map((x) => <li key={x}>{x}</li>)
            )}
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">Most mentioned</div>
          <div className="mt-2 flex flex-wrap gap-2 text-gray-700">
            {data &&
              Object.entries(data.keywordFrequency).map(([k, v]) => (
              <span key={k} className="rounded bg-secondary px-2 py-1 text-xs">
                {k} ({v})
              </span>
            ))}
            {(!data || Object.keys(data.keywordFrequency).length === 0) && (
              <span className="text-sm text-muted-foreground">No keywords</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">Sentiment</div>
          <div className="mt-2 text-sm">
            <span className="text-green-600 font-medium">{data?.sentimentStats.positive ?? 0}%</span>
            <span className="text-gray-500"> · </span>
            <span className="text-yellow-500 font-medium">{data?.sentimentStats.neutral ?? 0}%</span>
            <span className="text-gray-500"> · </span>
            <span className="text-red-500 font-medium">{data?.sentimentStats.negative ?? 0}%</span>
          </div>
        </div>
      </div>
      <div className="mt-4" style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Tooltip />
            <Radar name="Avg" dataKey="avg" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
