import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit') ?? 20)))
  const offset = Math.max(0, Number(sp.get('offset') ?? 0))
  const action = sp.get('action') || undefined

  const items = await prisma.activityLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
    include: { review: { include: { listing: true } } },
  })
  const data = items.map((i) => ({
    id: i.id,
    reviewId: i.reviewId,
    listingName: i.review.listing.name,
    action: i.action,
    previous: i.previous,
    next: i.next,
    createdAt: i.createdAt.toISOString(),
  }))
  return NextResponse.json({ items: data, nextOffset: items.length < limit ? null : offset + items.length })
}
