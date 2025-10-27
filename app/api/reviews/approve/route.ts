import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.ids) || typeof body.approved !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const { ids, approved } = body as { ids: string[]; approved: boolean }
  // fetch current states to log previous
  const before = await prisma.review.findMany({ where: { id: { in: ids } }, select: { id: true, approved: true } })
  await prisma.review.updateMany({ where: { id: { in: ids } }, data: { approved } })
  // activity logs
  const logs = before.map((r) => ({ reviewId: r.id, action: approved ? 'approve' : 'unapprove', previous: r.approved, next: approved }))
  if (logs.length) await prisma.activityLog.createMany({ data: logs })
  return NextResponse.json({ status: 'ok', updated: ids.length })
}
