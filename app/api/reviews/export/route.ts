import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const listingId = p.get('listingId') ?? undefined
  const channel = p.get('channel') ?? undefined
  const type = p.get('type') ?? undefined
  const status = p.get('status') ?? undefined
  const approvedParam = p.get('approved')
  const approved = approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined
  const minRating = p.get('minRating') ? Number(p.get('minRating')) : undefined
  const maxRating = p.get('maxRating') ? Number(p.get('maxRating')) : undefined
  const q = p.get('q') ?? undefined
  const from = p.get('from') ? new Date(String(p.get('from'))) : undefined
  const to = p.get('to') ? new Date(String(p.get('to'))) : undefined

  const where = {
    listingId,
    channel,
    type,
    status,
    approved,
    ratingOverall:
      minRating != null || maxRating != null
        ? { gte: minRating ?? undefined, lte: maxRating ?? undefined }
        : undefined,
    submittedAt:
      from || to
        ? { gte: from ?? undefined, lte: to ?? undefined }
        : undefined,
  } as any

  const raw = await prisma.review.findMany({
    where,
    include: { listing: true },
    orderBy: [{ submittedAt: 'desc' }],
  })

  let rows = raw
  if (q && q.trim().length >= 1) {
    const tokens = q.toLowerCase().split(/\s+/).map((s) => s.trim()).filter(Boolean)
    const ranked = raw
      .map((r) => {
        const a = (r.authorName ?? '').toLowerCase()
        const t = (r.publicText ?? '').toLowerCase()
        const l = r.listing.name.toLowerCase()
        const ch = (r.channel ?? '').toLowerCase()
        const ty = (r.type ?? '').toLowerCase()
        const nameTokens = a.split(/\s+/).filter(Boolean)
        const namePrefix = tokens.every((tok) => nameTokens.some((nt) => nt.startsWith(tok)))
        const listingPrefix = tokens.every((tok) => l.split(/\s+/).some((nt) => nt.startsWith(tok)))
        const nameContains = !namePrefix && tokens.every((tok) => a.includes(tok))
        const listingContains = !listingPrefix && tokens.every((tok) => l.includes(tok))
        const wordPrefixRegexes = tokens.map((tok) => new RegExp(`\\b${escapeRegExp(tok)}`, 'i'))
        const textWordPrefix =
          !namePrefix && !listingPrefix && !nameContains && !listingContains &&
          wordPrefixRegexes.every((rx) => rx.test(t))
        const textContains =
          !namePrefix && !listingPrefix && !nameContains && !listingContains && !textWordPrefix &&
          tokens.every((tok) => t.includes(tok))
        const metaContains = tokens.every((tok) => ch.includes(tok) || ty.includes(tok))
        let score = 0
        if (namePrefix) score = 6
        else if (listingPrefix) score = 5
        else if (nameContains || listingContains) score = 4
        else if (textWordPrefix) score = 3
        else if (metaContains) score = 2
        else if (textContains) score = 1
        return { r, score }
      })
      .filter((x) => x.score > 0)
    const maxScore = ranked.reduce((m, x) => Math.max(m, x.score), 0)
    rows = ranked.filter((x) => (maxScore >= 5 ? x.score >= 5 : x.score > 0)).map((x) => x.r)
  }

  const flat = rows.map((r) => ({
    id: r.id,
    listingName: r.listing.name,
    channel: r.channel ?? '',
    type: r.type ?? '',
    status: r.status ?? '',
    ratingOverall: r.ratingOverall ?? '',
    publicText: r.publicText ?? '',
    authorName: r.authorName ?? '',
    submittedAt: r.submittedAt ? r.submittedAt.toISOString() : '',
    approved: r.approved ? 'true' : 'false',
  }))

  const csv = toCsv(flat)
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="reviews-export.csv"',
      'cache-control': 'no-store',
    },
  })
}

function toCsv(rows: any[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (v: any) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""')
    return /[",\r\n]/.test(s) ? `"${s}"` : s
  }
  const lines = [headers.join(',')]
  for (const r of rows) lines.push(headers.map((h) => esc((r as any)[h])).join(','))
  return lines.join('\n')
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

