import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Approves all reviews within the provided filters that meet the threshold
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const threshold = Number(body?.threshold ?? 8)
  const query = body?.query as string | undefined
  const sp = new URLSearchParams(query ?? '')

  const listingId = sp.get('listingId') ?? undefined
  const channel = sp.get('channel') ?? undefined
  const type = sp.get('type') ?? undefined
  const status = sp.get('status') ?? undefined
  const approvedParam = sp.get('approved')
  const approvedFilter = approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined
  const minRating = sp.get('minRating') ? Number(sp.get('minRating')) : undefined
  const maxRating = sp.get('maxRating') ? Number(sp.get('maxRating')) : undefined
  const from = sp.get('from') ? new Date(String(sp.get('from'))) : undefined
  const to = sp.get('to') ? new Date(String(sp.get('to'))) : undefined

  const where: any = {
    listingId,
    channel,
    type,
    status,
    approved: approvedFilter ?? undefined,
    ratingOverall: { gte: Math.max(threshold, minRating ?? threshold), lte: maxRating ?? undefined },
    submittedAt: from || to ? { gte: from ?? undefined, lte: to ?? undefined } : undefined,
  }

  // Find candidates not already approved
  const candidates = await prisma.review.findMany({ where: { ...where, approved: false }, select: { id: true, approved: true } })
  if (!candidates.length) return NextResponse.json({ updated: 0 })
  const ids = candidates.map((c) => c.id)
  await prisma.review.updateMany({ where: { id: { in: ids } }, data: { approved: true } })
  await prisma.activityLog.createMany({ data: ids.map((id) => ({ reviewId: id, action: 'auto-approve', previous: false, next: true })) })
  return NextResponse.json({ updated: ids.length })
}

