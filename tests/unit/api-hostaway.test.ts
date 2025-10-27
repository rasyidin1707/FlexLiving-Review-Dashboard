import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/reviews/hostaway/route'

describe('/api/reviews/hostaway', () => {
  it('returns normalized structured data', async () => {
    const res = await GET()
    // @ts-expect-error body is private; mimic NextResponse.json().json() via private symbol
    const json = await res.json()
    expect(json.status).toBe('success')
    expect(Array.isArray(json.reviews)).toBe(true)
    expect(Array.isArray(json.listings)).toBe(true)
    // basic shape checks
    const r = json.reviews[0]
    expect(r).toHaveProperty('id')
    expect(r).toHaveProperty('listingId')
    expect(r).toHaveProperty('source', 'hostaway')
  })
})

