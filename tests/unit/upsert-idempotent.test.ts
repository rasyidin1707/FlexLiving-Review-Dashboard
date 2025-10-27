import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/db'
import { normalizeHostaway } from '@/lib/normalizers/hostaway'
import data from '@/data/hostaway-mock.json'

describe('idempotent upsert', () => {
  beforeAll(async () => {
    await prisma.review.deleteMany({})
    await prisma.listing.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('upserts by source+sourceReviewId', async () => {
    const normalized = normalizeHostaway(data as any)
    const nameSet = new Set(normalized.map((n) => n.listingName))
    for (const name of nameSet) {
      await prisma.listing.upsert({ where: { name }, update: {}, create: { name } })
    }
    const listings = await prisma.listing.findMany()
    const idByName = new Map(listings.map((l) => [l.name, l.id]))

    for (const n of normalized) {
      const externalKey = `${n.source}:${n.sourceReviewId ?? ''}`
      await prisma.review.upsert({
        where: { externalKey },
        update: { listingId: idByName.get(n.listingName)! },
        create: {
          listingId: idByName.get(n.listingName)!,
          source: n.source,
          sourceReviewId: n.sourceReviewId,
          externalKey,
        },
      })
    }
    const count1 = await prisma.review.count()
    for (const n of normalized) {
      const externalKey = `${n.source}:${n.sourceReviewId ?? ''}`
      await prisma.review.upsert({
        where: { externalKey },
        update: { listingId: idByName.get(n.listingName)! },
        create: {
          listingId: idByName.get(n.listingName)!,
          source: n.source,
          sourceReviewId: n.sourceReviewId,
          externalKey,
        },
      })
    }
    const count2 = await prisma.review.count()
    expect(count2).toBe(count1)
  })
})
