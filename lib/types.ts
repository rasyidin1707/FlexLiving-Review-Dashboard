export type NormalizedReview = {
  source: 'hostaway' | 'google'
  sourceReviewId: string | null
  listingName: string
  listingHostawayId?: number | null
  type: string | null
  status: string | null
  ratingOverall: number | null
  ratingItems: Record<string, number> | null
  publicText: string | null
  submittedAt: string | null
  authorName: string | null
  channel: string | null
}

export type ListingAggregate = {
  avgRatingAll: number | null
  avgRatingApproved: number | null
  reviewCounts: {
    total: number
    approved: number
    byChannel: Record<string, number>
    byType: Record<string, number>
  }
  recentIssues: string[]
}

export type ReviewsResponse = {
  status: 'success'
  listings: Array<{
    listingId: string
    listingName: string
    avgRating: number | null
    avgRatingAll: number | null
    avgRatingApproved: number | null
    reviewCounts: ListingAggregate['reviewCounts']
    recentIssues: string[]
  }>
  reviews: Array<{
    id: string
    source: 'hostaway' | 'google'
    sourceReviewId: string | null
    listingId: string
    listingName: string
    type: string | null
    status: string | null
    channel: string | null
    ratingOverall: number | null
    ratingItems: Record<string, number> | null
    publicText: string | null
    submittedAt: string | null
    authorName: string | null
    approved: boolean
  }>
}

