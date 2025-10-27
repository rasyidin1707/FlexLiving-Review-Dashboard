import { NextRequest } from 'next/server'
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

  const totals = { total: rows.length, approved: rows.filter((r) => r.approved).length }
  const ratingsAll = rows.map((r) => r.ratingOverall).filter((v): v is number => v != null)
  const ratingsApproved = rows.filter((r) => r.approved).map((r) => r.ratingOverall).filter((v): v is number => v != null)
  const averages = {
    all: ratingsAll.length ? avg(ratingsAll) : null,
    approved: ratingsApproved.length ? avg(ratingsApproved) : null,
  }

  const byChannel: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const r of rows) {
    const ch = r.channel ?? 'Unknown'
    byChannel[ch] = (byChannel[ch] ?? 0) + 1
    const ty = r.type ?? 'unknown'
    byType[ty] = (byType[ty] ?? 0) + 1
  }

  const insights = analyzeReviews(
    rows.map((r) => ({ ratingItems: (r.ratingItems as any) ?? null, publicText: r.publicText, ratingOverall: r.ratingOverall })),
  )

  // Generate a text-only PDF
  const jsPDFMod: any = await import('jspdf')
  const JsPDF = jsPDFMod.default || jsPDFMod.jsPDF
  const doc = new JsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin
  doc.setFontSize(16)
  doc.text('Flex Living – Reviews Summary', margin, y)
  doc.setFontSize(11)
  y += 22
  doc.text(`Total: ${totals.total}    Approved: ${totals.approved}`, margin, y)
  y += 16
  doc.text(`Avg (all): ${averages.all ?? '—'}    Avg (approved): ${averages.approved ?? '—'}`, margin, y)
  y += 22
  // Trend by month (avg rating)
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
    .map(([k, vals]) => ({ label: k, avg: avg(vals) }))

  y = block(doc, 'By channel', Object.entries(byChannel).map(([k, v]) => `${k}: ${v}`), margin, y)
  y = barChart(doc, 'Channels', byChannel, margin, y)
  y = lineChart(doc, 'Avg rating by month', trend, margin, y)
  y = block(doc, 'By type', Object.entries(byType).map(([k, v]) => `${k}: ${v}`), margin, y)
  y = block(doc, 'Top issues', insights.topIssues.length ? insights.topIssues : ['None'], margin, y)
  const s = insights.sentimentStats
  y = block(doc, 'Sentiment', [`+${s.positive}% / ~${s.neutral}% / -${s.negative}%`], margin, y)

  const arr = doc.output('arraybuffer') as ArrayBuffer
  return new Response(Buffer.from(arr), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="reviews-summary.pdf"',
      'cache-control': 'no-store',
    },
  })
}

function block(doc: any, title: string, lines: string[], margin: number, y: number) {
  const pageHeight = 842
  doc.setFontSize(12)
  if (y > pageHeight - 100) {
    doc.addPage()
    y = margin
  }
  doc.text(title, margin, y)
  doc.setFontSize(11)
  y += 14
  for (const line of lines) {
    if (y > pageHeight - 60) { doc.addPage(); y = margin }
    doc.text(line, margin, y)
    y += 14
  }
  y += 10
  return y
}

function barChart(doc: any, title: string, data: Record<string, number>, margin: number, y: number) {
  const entries = Object.entries(data)
  if (!entries.length) return y
  const pageHeight = 842
  if (y > pageHeight - 200) { doc.addPage(); y = margin }
  doc.setFontSize(12)
  doc.text(title, margin, y)
  y += 12
  const chartWidth = 420
  const chartHeight = 120
  const base = y + chartHeight
  const max = Math.max(...entries.map(([, v]) => v)) || 1
  // compute bar width and gap to fit nicely
  const count = entries.length
  const minBar = 16
  const minGap = 10
  let barW = Math.max(minBar, Math.floor(chartWidth / (count * 1.8)))
  let gap = Math.max(minGap, Math.floor((chartWidth - barW * count) / Math.max(1, count - 1)))
  let totalW = barW * count + gap * (count - 1)
  if (totalW > chartWidth) {
    // shrink bar width to fit
    barW = Math.max(12, Math.floor((chartWidth - gap * (count - 1)) / count))
    totalW = barW * count + gap * (count - 1)
  }
  let x = margin
  const leftPad = Math.max(0, (chartWidth - totalW) / 2)
  x += leftPad

  doc.setLineWidth(0.5)
  doc.line(margin, base, margin + chartWidth, base)
  doc.setFontSize(10)
  for (const [k, v] of entries) {
    const h = Math.round((v / max) * (chartHeight - 20))
    doc.rect(x, base - h, barW, h, 'F')
    // value above bar
    doc.text(String(v), x + barW / 2 - doc.getTextWidth(String(v)) / 2, base - h - 4)
    // label under bar; abbreviate if long
    const label = abbreviate(k, 10)
    doc.text(label, x + barW / 2 - doc.getTextWidth(label) / 2, base + 12)
    x += barW + gap
  }
  return base + 28
}

function lineChart(
  doc: any,
  title: string,
  points: Array<{ label: string; avg: number }>,
  margin: number,
  y: number,
) {
  if (!points.length) return y
  const pageHeight = 842
  if (y > pageHeight - 200) { doc.addPage(); y = margin }
  doc.setFontSize(12)
  doc.text(title, margin, y)
  y += 12
  const w = 500
  const h = 110
  const x0 = margin
  const y0 = y + h
  // axes
  doc.setLineWidth(0.5)
  doc.line(x0, y0, x0 + w, y0)
  doc.line(x0, y0 - h, x0, y0)
  const stepX = w / Math.max(1, points.length - 1)
  const scaleY = (v: number) => (v / 10) * h
  let prev: { x: number; y: number } | null = null
  const tickEvery = Math.max(1, Math.floor(points.length / 6))
  doc.setFontSize(9)
  points.forEach((p, i) => {
    const x = x0 + i * stepX
    const yv = y0 - scaleY(Math.max(0, Math.min(10, p.avg ?? 0)))
    if (prev) doc.line(prev.x, prev.y, x, yv)
    doc.circle(x, yv, 1.5, 'F')
    if (i % tickEvery === 0) {
      const label = p.label
      doc.text(label, x - doc.getTextWidth(label) / 2, y0 + 12)
    }
    prev = { x, y: yv }
  })
  return y0 + 26
}

function abbreviate(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

function avg(arr: number[]) { return Math.round((arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)) * 100) / 100 }
function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
