import type { ListingSummary, ReviewRow, RatingItems, Channel } from "@/components/flexliving/types";

export const mockListings: ListingSummary[] = [
  {
    id: "l1",
    name: "Soho Loft 2BR",
    total: 8,
    approved: 5,
    avgAll: 8.1,
    avgApproved: 8.6,
    monthlySeries: [
      { month: "2024-01", avg: 8.2 },
      { month: "2024-02", avg: 8.4 },
      { month: "2024-03", avg: 8.1 },
      { month: "2024-04", avg: 8.7 },
    ],
  },
  {
    id: "l2",
    name: "Camden Townhouse",
    total: 7,
    approved: 4,
    avgAll: 7.6,
    avgApproved: 7.9,
    monthlySeries: [
      { month: "2024-01", avg: 7.2 },
      { month: "2024-02", avg: 7.5 },
      { month: "2024-03", avg: 7.8 },
      { month: "2024-04", avg: 8.0 },
    ],
  },
  {
    id: "l3",
    name: "Shoreditch Studio",
    total: 5,
    approved: 2,
    avgAll: 6.8,
    avgApproved: 7.2,
    monthlySeries: [
      { month: "2024-01", avg: 6.5 },
      { month: "2024-02", avg: 6.9 },
      { month: "2024-03", avg: 7.0 },
    ],
  },
  {
    id: "l4",
    name: "Kensington Garden Flat",
    total: 6,
    approved: 4,
    avgAll: 8.7,
    avgApproved: 9.0,
    monthlySeries: [
      { month: "2024-01", avg: 8.5 },
      { month: "2024-02", avg: 8.8 },
      { month: "2024-03", avg: 8.9 },
    ],
  },
  {
    id: "l5",
    name: "Canary Wharf Riverside",
    total: 6,
    approved: 3,
    avgAll: 7.9,
    avgApproved: 8.2,
    monthlySeries: [
      { month: "2024-01", avg: 7.6 },
      { month: "2024-02", avg: 8.1 },
      { month: "2024-03", avg: 8.0 },
    ],
  },
];

const items = (values: Partial<RatingItems>): RatingItems => ({
  cleanliness: undefined,
  communication: undefined,
  location: undefined,
  value: undefined,
  checkin: undefined,
  accuracy: undefined,
  ...values,
});

export const mockReviews: ReviewRow[] = [
  { id: "r1", listingId: "l1", listingName: "Soho Loft 2BR", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 9, ratingItems: items({ cleanliness: 9, communication: 10, location: 9 }), publicText: "Fantastic location and very responsive host.", authorName: "Alice", submittedAt: "2024-02-10", approved: true, sentimentScore: 0.8 },
  { id: "r2", listingId: "l1", listingName: "Soho Loft 2BR", channel: "Booking", type: "guest-to-host", status: "published", ratingOverall: 8, ratingItems: items({ cleanliness: 8, communication: 8, value: 7 }), publicText: "Good stay, a bit noisy on weekends.", authorName: "Ben", submittedAt: "2024-03-12", approved: false, sentimentScore: 0.2 },
  { id: "r3", listingId: "l2", listingName: "Camden Townhouse", channel: "Hostaway", type: "guest-to-host", status: "published", ratingOverall: 7, ratingItems: items({ cleanliness: 6, communication: 7, checkin: 6 }), publicText: "Check-in was slightly confusing but overall okay.", authorName: "Cara", submittedAt: "2024-02-18", approved: true, sentimentScore: 0.0 },
  { id: "r4", listingId: "l2", listingName: "Camden Townhouse", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 6, ratingItems: items({ cleanliness: 6, communication: 6, location: 7 }), publicText: "Decent value, could be cleaner.", authorName: "Dan", submittedAt: "2024-01-21", approved: false, sentimentScore: -0.2 },
  { id: "r5", listingId: "l3", listingName: "Shoreditch Studio", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 5, ratingItems: items({ cleanliness: 5, communication: 6, location: 6 }), publicText: "Trendy area but noisy at night.", authorName: "Ella", submittedAt: "2024-03-01", approved: false, sentimentScore: -0.3 },
  { id: "r6", listingId: "l3", listingName: "Shoreditch Studio", channel: "Hostaway", type: "host-to-guest", status: "published", ratingOverall: 9, ratingItems: items({ communication: 9, accuracy: 9 }), publicText: "Great guest, welcome back any time.", authorName: "Host", submittedAt: "2024-02-07", approved: true, sentimentScore: 0.9 },
  { id: "r7", listingId: "l4", listingName: "Kensington Garden Flat", channel: "Booking", type: "guest-to-host", status: "published", ratingOverall: 10, ratingItems: items({ cleanliness: 10, location: 10, value: 9 }), publicText: "Absolutely perfect stay!", authorName: "Frank", submittedAt: "2024-01-05", approved: true, sentimentScore: 1.0 },
  { id: "r8", listingId: "l4", listingName: "Kensington Garden Flat", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 8, ratingItems: items({ cleanliness: 8, communication: 9, value: 7 }), publicText: "Lovely area, bathroom could use an update.", authorName: "Grace", submittedAt: "2024-03-08", approved: false, sentimentScore: 0.3 },
  { id: "r9", listingId: "l5", listingName: "Canary Wharf Riverside", channel: "Booking", type: "guest-to-host", status: "published", ratingOverall: 8, ratingItems: items({ cleanliness: 8, communication: 9, accuracy: 8 }), publicText: "Great for business trip.", authorName: "Hank", submittedAt: "2024-02-15", approved: true, sentimentScore: 0.5 },
  { id: "r10", listingId: "l5", listingName: "Canary Wharf Riverside", channel: "Hostaway", type: "guest-to-host", status: "published", ratingOverall: 7, ratingItems: items({ cleanliness: 7, communication: 7, value: 7 }), publicText: "Solid overall.", authorName: "Iris", submittedAt: "2024-03-22", approved: false, sentimentScore: 0.1 },
  { id: "r11", listingId: "l1", listingName: "Soho Loft 2BR", channel: "Google", type: "guest-to-host", status: "published", ratingOverall: 9, ratingItems: items({ cleanliness: 9, communication: 9 }), publicText: "Clean and comfy.", authorName: "Jake", submittedAt: "2024-02-03", approved: true, sentimentScore: 0.7 },
  { id: "r12", listingId: "l1", listingName: "Soho Loft 2BR", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 8, ratingItems: items({ cleanliness: 8, communication: 8 }), publicText: "Nice place!", authorName: "Kim", submittedAt: "2024-02-08", approved: false, sentimentScore: 0.6 },
  { id: "r13", listingId: "l2", listingName: "Camden Townhouse", channel: "Google", type: "guest-to-host", status: "published", ratingOverall: 7, ratingItems: items({ cleanliness: 7, communication: 7 }), publicText: "Convenient.", authorName: "Liam", submittedAt: "2024-01-18", approved: true, sentimentScore: 0.2 },
  { id: "r14", listingId: "l2", listingName: "Camden Townhouse", channel: "Booking", type: "guest-to-host", status: "published", ratingOverall: 6, ratingItems: items({ cleanliness: 6, communication: 6 }), publicText: "Okay stay.", authorName: "Mia", submittedAt: "2024-03-02", approved: false, sentimentScore: -0.1 },
  { id: "r15", listingId: "l3", listingName: "Shoreditch Studio", channel: "Google", type: "guest-to-host", status: "published", ratingOverall: 6, ratingItems: items({ cleanliness: 6, communication: 7 }), publicText: "A bit loud but cool area.", authorName: "Noah", submittedAt: "2024-02-10", approved: false, sentimentScore: -0.2 },
  { id: "r16", listingId: "l3", listingName: "Shoreditch Studio", channel: "Booking", type: "guest-to-host", status: "published", ratingOverall: 5, ratingItems: items({ cleanliness: 5, communication: 6 }), publicText: "Could be cleaner.", authorName: "Olivia", submittedAt: "2024-03-03", approved: false, sentimentScore: -0.4 },
  { id: "r17", listingId: "l4", listingName: "Kensington Garden Flat", channel: "Hostaway", type: "host-to-guest", status: "published", ratingOverall: 10, ratingItems: items({ communication: 10 }), publicText: "Wonderful guest.", authorName: "Host", submittedAt: "2024-02-01", approved: true, sentimentScore: 0.9 },
  { id: "r18", listingId: "l5", listingName: "Canary Wharf Riverside", channel: "Airbnb", type: "guest-to-host", status: "published", ratingOverall: 8, ratingItems: items({ cleanliness: 8, communication: 9 }), publicText: "Would stay again.", authorName: "Pia", submittedAt: "2024-03-12", approved: true, sentimentScore: 0.7 },
];

export function getInsights() {
  const words: Record<string, number> = {};
  const catTotals: Record<string, { total: number; count: number }> = {};
  const monthKey = (d: string | undefined | null) => (d ? (d.length >= 7 ? d.slice(0, 7) : d) : "");
  const byMonth: Record<string, { total: number; pos: number; neg: number; neu: number }> = {};
  const channels: Record<string, number> = {};
  for (const r of mockReviews) {
    if (r.channel) channels[r.channel] = (channels[r.channel] ?? 0) + 1;
    if (r.publicText) {
      r.publicText
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter(Boolean)
        .forEach((w) => {
          words[w] = (words[w] ?? 0) + 1;
        });
    }
    if (r.ratingItems) {
      for (const [k, v] of Object.entries(r.ratingItems)) {
        if (typeof v !== "number") continue;
        if (!catTotals[k]) catTotals[k] = { total: 0, count: 0 };
        catTotals[k].total += v;
        catTotals[k].count += 1;
      }
    }
    const mk = monthKey(r.submittedAt || undefined);
    if (mk) {
      if (!byMonth[mk]) byMonth[mk] = { total: 0, pos: 0, neg: 0, neu: 0 };
      const s = typeof r.sentimentScore === "number" ? r.sentimentScore : 0;
      byMonth[mk].total += 1;
      if (s > 0.15) byMonth[mk].pos += 1; else if (s < -0.15) byMonth[mk].neg += 1; else byMonth[mk].neu += 1;
    }
  }
  const categoryAverages: RatingItems = Object.fromEntries(
    Object.entries(catTotals).map(([k, { total, count }]) => [k, Math.round((total / count) * 100) / 100]),
  );
  const topIssues = Object.entries(categoryAverages)
    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))
    .slice(0, 3)
    .map(([k]) => k);
  const stop = new Set(["the", "and", "a", "to", "of", "was", "is", "in", "we", "it"]);
  const keywords = Object.entries(words)
    .filter(([k]) => !stop.has(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([term, count]) => ({ term, count }));
  let pos = 0, neg = 0, neu = 0;
  for (const r of mockReviews) {
    const s = typeof r.sentimentScore === "number" ? r.sentimentScore : 0;
    if (s > 0.15) pos++; else if (s < -0.15) neg++; else neu++;
  }
  const total = pos + neg + neu || 1;
  const sentiment = { positive: Math.round((pos / total) * 100), neutral: Math.round((neu / total) * 100), negative: Math.round((neg / total) * 100) };
  const months = Object.keys(byMonth).sort();
  const sentimentHistory = months.map((m) => {
    const v = byMonth[m];
    const t = v.total || 1;
    return { month: m, positive: Math.round((v.pos / t) * 100), neutral: Math.round((v.neu / t) * 100), negative: Math.round((v.neg / t) * 100) };
  });
  const channelBreakdown = Object.entries(channels).map(([channel, count]) => ({ channel: channel as Channel, count }));
  const lowByMonth: Record<string, Record<string, number>> = {};
  for (const r of mockReviews) {
    const mk = monthKey(r.submittedAt || undefined);
    if (!mk || !r.ratingItems) continue;
    for (const [k, v] of Object.entries(r.ratingItems)) {
      if (typeof v !== "number") continue;
      if (v < 7) {
        if (!lowByMonth[mk]) lowByMonth[mk] = {};
        lowByMonth[mk][k] = (lowByMonth[mk][k] ?? 0) + 1;
      }
    }
  }
  const topIssueTrends: Record<string, number[]> = {};
  for (const issue of topIssues) {
    topIssueTrends[issue] = months.map((m) => lowByMonth[m]?.[issue] ?? 0);
  }
  return { topIssues, keywords, sentiment, categoryAverages, sentimentHistory, channelBreakdown, topIssueTrends };
}
