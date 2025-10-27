import fs from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/db'
import { normalizeHostaway } from '@/lib/normalizers/hostaway'

async function main() {
  console.log('Seeding database...')
  // reset
  await prisma.review.deleteMany()
  await prisma.listing.deleteMany()

  const file = path.join(process.cwd(), 'data', 'hostaway-mock.json')
  const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
  const normalized = normalizeHostaway(raw)

  // Insert listings first
  const listingMap = new Map<string, string>() // listingName -> id
  for (const r of normalized) {
    if (!listingMap.has(r.listingName)) {
      const listing = await prisma.listing.upsert({
        where: { name: r.listingName },
        update: {},
        create: {
          name: r.listingName,
          channel: 'Hostaway',
          hostawayId: r.listingHostawayId ?? undefined,
        },
      })
      listingMap.set(r.listingName, listing.id)
    }
  }

  // Insert reviews idempotently
  for (const r of normalized) {
    const listingId = listingMap.get(r.listingName)!
    const externalKey = `${r.source}:${r.sourceReviewId ?? ''}`
    await prisma.review.upsert({
      where: { externalKey },
      update: {
        listingId,
        type: r.type ?? undefined,
        status: r.status ?? undefined,
        ratingOverall: r.ratingOverall ?? undefined,
        ratingItems: r.ratingItems ? JSON.stringify(r.ratingItems) : undefined,
        publicText: r.publicText ?? undefined,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : undefined,
        authorName: r.authorName ?? undefined,
        channel: r.channel ?? undefined,
      },
      create: {
        source: r.source,
        sourceReviewId: r.sourceReviewId,
        externalKey,
        listingId,
        type: r.type,
        status: r.status,
        ratingOverall: r.ratingOverall,
        ratingItems: r.ratingItems ? JSON.stringify(r.ratingItems) : null,
        publicText: r.publicText,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : null,
        authorName: r.authorName,
        channel: r.channel,
        approved: Math.random() < 0.5,
      },
    })
  }

  console.log('Seeding complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
