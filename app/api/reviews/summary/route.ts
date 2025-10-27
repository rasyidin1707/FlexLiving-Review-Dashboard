import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeReviews } from '@/lib/insights'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const listingId = p.get('listingId') ?? undefined
  const channel = p.get('channel') ?? undefined
  const type = p.get('type') ?? undefined
  const status = p.get('status') ?? undefined
  const approvedParam = p.get('approved')
  const approved = approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined
  const channelsParam = p.get('channels') ?? ''
  const channelsArr = channelsParam.split(',').map((s)=>s.trim()).filter(Boolean)
  const minRating = p.get('minRating') ? Number(p.get('minRating')) : undefined
  const maxRating = p.get('maxRating') ? Number(p.get('maxRating')) : undefined
  const q = p.get('q') ?? undefined
  const from = p.get('from') ? new Date(String(p.get('from'))) : undefined
  const to = p.get('to') ? new Date(String(p.get('to'))) : undefined
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const sanitizeList = (raw: string | null, { max = 8, toLower = true }: { max?: number; toLower?: boolean } = {}) => {
    if (!raw) return [] as string[]
    const out: string[] = []
    for (const part of raw.split(',')) {
      let s = part.trim()
      if (!s) continue
      if (toLower) s = s.toLowerCase()
      s = s.replace(/[^a-z0-9_\-\s]/gi, '')
      if (!s) continue
      if (!out.includes(s)) out.push(s)
      if (out.length >= max) break
    }
    return out
  }
  const categories = sanitizeList(p.get('categories'), { max: 8, toLower: true })
  const catMinRaw = p.get('catMin')
  const catMin = catMinRaw != null ? clamp(Number(catMinRaw) || 0, 0, 10) : undefined
  const keywords = sanitizeList(p.get('keywords'), { max: 8, toLower: true })

  const baseWhere = {
    listingId,
    channel: channelsArr.length ? { in: channelsArr } : channel,
    type,
    status,
    approved,
    ratingOverall:
      minRating != null || maxRating != null
        ? {
            gte: minRating ?? undefined,
            lte: maxRating ?? undefined,
          }
        : undefined,
    submittedAt:
      from || to
        ? {
            gte: from ?? undefined,
            lte: to ?? undefined,
          }
        : undefined,
  } as any

  // Fetch raw rows for the filtered set
  const raw = await prisma.review.findMany({
    where: baseWhere,
    include: { listing: true },
    orderBy: [{ submittedAt: 'desc' }],
  })

  // Apply free-text search/ranking if q provided
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
    const filtered = ranked.filter((x) => (maxScore >= 5 ? x.score >= 5 : x.score > 0)).map((x) => x.r)
    rows = filtered
  }

  // Category + keyword server-side filters (in-memory)
  if (categories.length > 0 || keywords.length > 0) {
    rows = rows.filter((r) => {
      if (categories.length) {
        const items = r.ratingItems ? (JSON.parse(String(r.ratingItems)) as Record<string, number>) : undefined
        const min = catMin ?? 0
        const ok = categories.every((c) => {
          const val = items ? items[c] : undefined
          return typeof val === 'number' && val >= min
        })
        if (!ok) return false
      }
      if (keywords.length) {
        const text = (r.publicText ?? '').toLowerCase()
        if (!keywords.every((k) => text.includes(k))) return false
      }
      return true
    })
  }

  const total = rows.length
  const approvedCount = rows.filter((r) => r.approved).length

  const ratingsAll = rows.map((r) => r.ratingOverall).filter((v): v is number => v != null)
  const ratingsApproved = rows
    .filter((r) => r.approved)
    .map((r) => r.ratingOverall)
    .filter((v): v is number => v != null)

  const avgAll = ratingsAll.length ? avg(ratingsAll) : null
  const avgApproved = ratingsApproved.length ? avg(ratingsApproved) : null

  // Trend by month
  const trendMap = new Map<string, number[]>()
  for (const r of rows) {
    if (!r.submittedAt || r.ratingOverall == null) continue
    const d = r.submittedAt
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!trendMap.has(k)) trendMap.set(k, [])
    trendMap.get(k)!.push(r.ratingOverall)
  }
  const trend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, vals]) => ({ month: k, avg: avg(vals) }))

  // Counts by channel and type
  const byChannel: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const r of rows) {
    const ch = r.channel ?? 'Unknown'
    byChannel[ch] = (byChannel[ch] ?? 0) + 1
    const ty = r.type ?? 'unknown'
    byType[ty] = (byType[ty] ?? 0) + 1
  }

  // Sentiment by month (naive using word presence similar to analyzeReviews)
  const monthKey = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : '')
  const posWords = ['great','amazing','perfect','nice','clean','responsive','wonderful','would stay again','spacious','well-equipped']
  const negWords = ['noisy','confusing','dirty','bad','poor','issue','problem','outdated']
  const byMonth: Record<string,{total:number;pos:number;neg:number;neu:number}> = {}
  for (const r of rows) {
    const mk = monthKey(r.submittedAt)
    if (!mk) continue
    if (!byMonth[mk]) byMonth[mk] = { total:0,pos:0,neg:0,neu:0 }
    const text = (r.publicText ?? '').toLowerCase()
    let s = 0
    for (const w of posWords) if (text.includes(w)) s++
    for (const w of negWords) if (text.includes(w)) s--
    if (s > 0) byMonth[mk].pos++
    else if (s < 0) byMonth[mk].neg++
    else byMonth[mk].neu++
    byMonth[mk].total++
  }
  const sentimentHistory = Object.keys(byMonth).sort().map((m) => {
    const v = byMonth[m]; const t = v.total || 1
    return { month: m, positive: Math.round((v.pos/t)*100), neutral: Math.round((v.neu/t)*100), negative: Math.round((v.neg/t)*100) }
  })

  // Insights based on all filtered rows
  const insights = analyzeReviews(
    rows.map((r) => ({ ratingItems: (r.ratingItems as any) ?? null, publicText: r.publicText, ratingOverall: r.ratingOverall })),
  )

  return NextResponse.json({
    totals: { total, approved: approvedCount },
    averages: { all: avgAll, approved: avgApproved },
    trend,
    byChannel,
    byType,
    insights,
    sentimentHistory,
    channelBreakdown: Object.entries(byChannel).map(([channel,count]) => ({ channel, count })),
  })
}

function avg(arr: number[]) {
  return Math.round((arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)) * 100) / 100
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
