"use client"

import type { FC } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { month: string; avg: number }

export const TrendChart: FC<{ data: DataPoint[] }> = ({ data }) => {
  return (
    <div className="card" id="trend-chart">
      <div className="mb-2 text-sm font-semibold text-gray-800">Average rating by month</div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 10]} />
            <Tooltip wrapperStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
            <Line type="monotone" dataKey="avg" stroke="#6366F1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
