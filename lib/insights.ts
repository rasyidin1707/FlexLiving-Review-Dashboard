import type { Prisma } from '@prisma/client'

export type SimpleReview = {
  ratingItems: string | null
  publicText: string | null
  ratingOverall: number | null
}

export function analyzeReviews(reviews: SimpleReview[]) {
  const categories: Record<string, { total: number; count: number }> = {}
  const freq: Record<string, number> = {}
  let pos = 0,
    neu = 0,
    neg = 0

  const positiveWords = new Set(['great', 'amazing', 'perfect', 'nice', 'clean', 'responsive', 'wonderful', 'would stay again', 'spacious', 'well-equipped'])
  const negativeWords = new Set(['noisy', 'confusing', 'dirty', 'bad', 'poor', 'issue', 'problem', 'outdated'])

  for (const r of reviews) {
    if (r.ratingItems) {
      try {
        const parsed = JSON.parse(r.ratingItems) as Record<string, number>
        for (const [k, v] of Object.entries(parsed)) {
          if (v == null) continue
          if (!categories[k]) categories[k] = { total: 0, count: 0 }
          categories[k].total += v
          categories[k].count += 1
        }
      } catch {}
    }
    const text = (r.publicText ?? '').toLowerCase()
    if (text) {
      for (const w of text.split(/[^a-z]+/).filter(Boolean)) {
        freq[w] = (freq[w] ?? 0) + 1
      }
      // naive sentiment: look for any tokens in sets
      let s = 0
      for (const w of positiveWords) if (text.includes(w)) s++
      for (const w of negativeWords) if (text.includes(w)) s--
      if (s > 0) pos++
      else if (s < 0) neg++
      else neu++
    } else {
      neu++
    }
  }

  const averages: Record<string, number> = {}
  Object.entries(categories).forEach(([k, v]) => {
    averages[k] = Math.round((v.total / Math.max(1, v.count)) * 100) / 100
  })

  const topIssues = Object.entries(averages)
    .filter(([, avg]) => avg < 6)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k)
    .slice(0, 5)

  const total = pos + neu + neg || 1
  const sentimentStats = {
    positive: Math.round((pos / total) * 100),
    neutral: Math.round((neu / total) * 100),
    negative: Math.round((neg / total) * 100),
  }

  // remove very common stop words from frequency
  const stop = new Set(['the', 'and', 'to', 'a', 'of', 'we', 'was', 'is', 'in', 'on', 'it', 'for'])
  for (const s of stop) delete freq[s]

  const keywordFrequency = Object.fromEntries(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30),
  )

  return { topIssues, keywordFrequency, sentimentStats, categoryAverages: averages }
}

