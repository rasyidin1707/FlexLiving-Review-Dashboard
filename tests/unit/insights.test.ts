import { describe, it, expect } from 'vitest'
import { analyzeReviews } from '@/lib/insights'

describe('analyzeReviews', () => {
  it('computes top issues and sentiment', () => {
    const res = analyzeReviews([
      { ratingItems: JSON.stringify({ cleanliness: 5, communication: 9 }), publicText: 'Great clean place', ratingOverall: 9 },
      { ratingItems: JSON.stringify({ cleanliness: 4, communication: 6 }), publicText: 'noisy and confusing check in', ratingOverall: 6 },
    ])
    expect(Array.isArray(res.topIssues)).toBe(true)
    expect(res.sentimentStats.positive + res.sentimentStats.neutral + res.sentimentStats.negative).toBe(100)
  })
})

