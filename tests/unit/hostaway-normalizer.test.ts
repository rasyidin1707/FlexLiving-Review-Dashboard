import { describe, it, expect } from 'vitest'
import { normalizeHostaway, toTenScale, extractIssues } from '@/lib/normalizers/hostaway'

describe('toTenScale', () => {
  it('returns null for nulls', () => {
    expect(toTenScale(null, 10)).toBeNull()
    expect(toTenScale(undefined, 10)).toBeNull()
  })
  it('converts 5-star to 10-scale', () => {
    expect(toTenScale(5, 5)).toBe(10)
    expect(toTenScale(2.5, 5)).toBe(5)
  })
  it('keeps 10-scale', () => {
    expect(toTenScale(7, 10)).toBe(7)
  })
  it('unknown scale -> null', () => {
    // @ts-expect-error
    expect(toTenScale(4, null)).toBeNull()
  })
})

describe('normalizeHostaway', () => {
  it('handles empty input', () => {
    expect(normalizeHostaway([])).toEqual([])
  })
  it('parses review and normalizes fields', () => {
    const raw = [
      {
        id: 1,
        listingName: 'Test',
        rating: 4,
        ratingScale: 5,
        reviewCategory: [
          { category: 'cleanliness', rating: 9 },
          { category: 'communication', rating: 8 }
        ],
        submittedAt: '2020-08-21 22:45:14',
        guestName: 'Alice',
      },
    ]
    const [n] = normalizeHostaway(raw)
    expect(n.listingName).toBe('Test')
    expect(n.ratingOverall).toBe(8)
    expect(n.ratingItems).toEqual({ cleanliness: 9, communication: 8 })
    expect(n.submittedAt).toBe('2020-08-21T22:45:14.000Z')
    expect(n.authorName).toBe('Alice')
  })
})

describe('extractIssues', () => {
  it('returns lowest recurring categories', () => {
    const reviews = normalizeHostaway([
      { id: 1, listingName: 'A', rating: 8, ratingScale: 10, reviewCategory: [ { category: 'cleanliness', rating: 6 }, { category: 'communication', rating: 7 } ] },
      { id: 2, listingName: 'A', rating: 7, ratingScale: 10, reviewCategory: [ { category: 'cleanliness', rating: 5 }, { category: 'communication', rating: 9 } ] },
      { id: 3, listingName: 'A', rating: 6, ratingScale: 10, reviewCategory: [ { category: 'check_in', rating: 4 } ] }
    ])
    const issues = extractIssues(reviews)
    expect(issues[0]).toBe('cleanliness')
  })
})

