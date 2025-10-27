import { describe, it, expect } from 'vitest'
import { toCsv } from '@/lib/export'

describe('toCsv', () => {
  it('builds csv with headers', () => {
    const csv = toCsv([
      { id: '1', listingName: 'A', channel: 'Airbnb', type: 'guest-to-host', status: 'published', ratingOverall: 9, publicText: 'Great', authorName: 'Alice', submittedAt: '2024-01-01', approved: true },
    ])
    expect(csv.split('\n')[0]).toContain('id,listingName')
    expect(csv).toContain('Alice')
  })
})

