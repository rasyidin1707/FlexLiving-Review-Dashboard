import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const page = Math.max(1, Number(p.get('page') ?? 1))
  const perPage = Math.min(50, Math.max(1, Number(p.get('perPage') ?? 10)))
  const listingId = p.get('listingId') ?? undefined
  const channel = p.get('channel') ?? undefined
  const type = p.get('type') ?? undefined
  const status = p.get('status') ?? undefined
  const approvedParam = p.get('approved')
  const approved = approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined
  const channelsParam = p.get('channels') ?? ''
  const channelsArr = channelsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const minRating = p.get('minRating') ? Number(p.get('minRating')) : undefined
  const maxRating = p.get('maxRating') ? Number(p.get('maxRating')) : undefined
  const q = p.get('q') ?? undefined
  const from = p.get('from') ? new Date(String(p.get('from'))) : undefined
  const to = p.get('to') ? new Date(String(p.get('to'))) : undefined
  const sortBy = (p.get('sortBy') ?? '') as 'date' | 'rating' | 'listing' | ''
  const sortDir = (p.get('sortDir') ?? 'desc') as 'asc' | 'desc'
  // --- validation helpers ---
  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
  const sanitizeList = (raw: string | null, { max = 8, toLower = true }: { max?: number; toLower?: boolean } = {}) => {
    if (!raw) return [] as string[]
    const out: string[] = []
    for (const part of raw.split(',')) {
      let s = part.trim()
      if (!s) continue
      if (toLower) s = s.toLowerCase()
      // keep letters, numbers, dash/underscore/spaces
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

  // Build base filters (excluding free-text search) server-side
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

  // If q is provided, perform case-insensitive match on authorName/publicText in-memory
  // to avoid SQLite collation quirks with Prisma's mode: 'insensitive'.
  if ((q && q.trim().length >= 1) || categories.length > 0 || keywords.length > 0) {
    const raw = await prisma.review.findMany({
      where: baseWhere,
      include: { listing: true },
      orderBy: [{ submittedAt: 'desc' }],
    })
    const tokens = (q ?? '').toLowerCase().split(/\s+/).map((s) => s.trim()).filter(Boolean)

    // Compute ranking buckets
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
      .filter((x) => (tokens.length ? x.score > 0 : true))

    // Apply category and keyword filters in-memory
    const filteredByCat = ranked.filter(({ r }) => {
      if (categories.length === 0 && keywords.length === 0) return true
      const items = r.ratingItems ? (JSON.parse(String(r.ratingItems)) as Record<string, number>) : undefined
      if (categories.length) {
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

    // If we have any prefix matches (name or listing), keep only those; else keep all matches
    const maxScore = filteredByCat.reduce((m, x) => Math.max(m, x.score), 0)
    let filteredRanked = tokens.length
      ? filteredByCat.filter((x) => (maxScore >= 5 ? x.score >= 5 : x.score > 0))
      : filteredByCat

    // Optional sort override when searching
    if (sortBy) {
      const cmp = (a: any, b: any) => {
        if (sortBy === 'date') {
          const ad = a.r.submittedAt ? a.r.submittedAt.getTime() : 0
          const bd = b.r.submittedAt ? b.r.submittedAt.getTime() : 0
          return ad - bd
        }
        if (sortBy === 'rating') {
          const av = a.r.ratingOverall ?? -Infinity
          const bv = b.r.ratingOverall ?? -Infinity
          return av - bv
        }
        if (sortBy === 'listing') {
          return (a.r.listing.name || '').localeCompare(b.r.listing.name || '')
        }
        return 0
      }
      filteredRanked = filteredRanked.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)))
    }

    // Sort by score desc then date desc
    filteredRanked.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const ad = a.r.submittedAt ? a.r.submittedAt.getTime() : 0
      const bd = b.r.submittedAt ? b.r.submittedAt.getTime() : 0
      return bd - ad
    })

    const total = filteredRanked.length
    const pagedRanked = filteredRanked.slice(
      (page - 1) * perPage,
      (page - 1) * perPage + perPage,
    )
    const paged = pagedRanked.map((x) => x.r)
    const payload = {
      page,
      perPage,
      total,
      items: paged.map((r) => ({
        id: r.id,
        listingId: r.listingId,
        listingName: r.listing.name,
        source: r.source,
        sourceReviewId: r.sourceReviewId,
        type: r.type,
        status: r.status,
        channel: r.channel,
        ratingOverall: r.ratingOverall,
        ratingItems: r.ratingItems ? (JSON.parse(String(r.ratingItems)) as any) : null,
        publicText: r.publicText,
        submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
        authorName: r.authorName,
        approved: r.approved,
        sentimentScore: deriveSentiment(r.publicText ?? null),
      })),
    }
    return NextResponse.json(payload)
  }

  // No free-text search: use DB-level pagination
  const orderBy: any[] = []
  if (sortBy === 'date') orderBy.push({ submittedAt: sortDir })
  else if (sortBy === 'rating') orderBy.push({ ratingOverall: sortDir })
  else if (sortBy === 'listing') orderBy.push({ listing: { name: sortDir } })
  else orderBy.push({ submittedAt: 'desc' })

  const [total, items] = await Promise.all([
    prisma.review.count({ where: baseWhere }),
    prisma.review.findMany({
      where: baseWhere,
      include: { listing: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])

  const payload = {
    page,
    perPage,
    total,
    items: items.map((r) => ({
      id: r.id,
      listingId: r.listingId,
      listingName: r.listing.name,
      source: r.source,
      sourceReviewId: r.sourceReviewId,
      type: r.type,
      status: r.status,
      channel: r.channel,
      ratingOverall: r.ratingOverall,
      ratingItems: r.ratingItems ? (JSON.parse(String(r.ratingItems)) as any) : null,
      publicText: r.publicText,
      submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
      authorName: r.authorName,
      approved: r.approved,
      sentimentScore: deriveSentiment(r.publicText ?? null),
    })),
  }
  
  return NextResponse.json(payload)
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function deriveSentiment(text: string | null): number | undefined {
  if (!text) return 0
  const t = text.toLowerCase()
  const pos = ['great','amazing','perfect','nice','clean','responsive','wonderful','would stay again','spacious','well-equipped']
  const neg = ['noisy','confusing','dirty','bad','poor','issue','problem','outdated']
  let p = 0, n = 0
  for (const w of pos) if (t.includes(w)) p++
  for (const w of neg) if (t.includes(w)) n++
  const denom = Math.max(1, p + n)
  return (p - n) / denom
}
