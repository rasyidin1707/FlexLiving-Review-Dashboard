import { NextRequest, NextResponse } from 'next/server'
import { toTenScale } from '@/lib/normalizers/hostaway'
import type { NormalizedReview } from '@/lib/types'

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = req.nextUrl.searchParams.get('placeId')

  if (!apiKey) {
    return NextResponse.json({ status: 'disabled', reason: 'Missing GOOGLE_PLACES_API_KEY' })
  }
  if (!placeId) {
    return NextResponse.json({ status: 'error', reason: 'Missing placeId' }, { status: 400 })
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'reviews,name')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Google Places API error')
    const json = await res.json()
    const name = json?.result?.name ?? 'Unknown Listing'
    const reviews: any[] = json?.result?.reviews ?? []

    const normalized: NormalizedReview[] = reviews.map((r) => ({
      source: 'google',
      sourceReviewId: r?.time ? String(r.time) : null,
      listingName: name,
      listingHostawayId: null,
      type: 'guest-to-host',
      status: 'published',
      ratingOverall: toTenScale(r?.rating ?? null, 5),
      ratingItems: null,
      publicText: r?.text ?? null,
      submittedAt: r?.time ? new Date(r.time * 1000).toISOString() : null,
      authorName: r?.author_name ?? null,
      channel: 'Google',
    }))

    return NextResponse.json({ status: 'success', listingName: name, reviews: normalized })
  } catch (e) {
    return NextResponse.json({ status: 'error', reason: 'Failed to fetch' }, { status: 500 })
  }
}

