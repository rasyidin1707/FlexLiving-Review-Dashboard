"use client"

import type { FC } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { channel: string; count: number }

export const ChannelBarChart: FC<{ data: DataPoint[] }> = ({ data }) => {
  return (
    <div className="card" id="channel-chart">
      <div className="mb-2 text-sm font-semibold text-gray-800">Reviews by channel</div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip wrapperStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
            <Bar dataKey="count" fill="#06B6D4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
