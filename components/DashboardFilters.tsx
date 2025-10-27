"use client"

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'

export type Filters = {
  listingId?: string
  channel?: string
  type?: string
  status?: string
  approved?: 'true' | 'false'
  minRating?: number
  maxRating?: number
  from?: string
  to?: string
  q?: string
}

export function DashboardFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [state, setState] = useState<Filters>(() => ({
    listingId: params.get('listingId') || undefined,
    channel: params.get('channel') || undefined,
    type: params.get('type') || undefined,
    status: params.get('status') || undefined,
    approved: (params.get('approved') as any) || undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    maxRating: params.get('maxRating') ? Number(params.get('maxRating')) : undefined,
    from: params.get('from') || undefined,
    to: params.get('to') || undefined,
    q: params.get('q') || undefined,
  }))

  // On first mount, if URL has no explicit filters, restore last state from localStorage
  useEffect(() => {
    const hasParams = Array.from(params.keys()).length > 0
    if (hasParams) return
    try {
      const raw = localStorage.getItem('flex-reviews:filters')
      if (raw) {
        const saved = JSON.parse(raw)
        setState((s) => ({ ...s, ...saved }))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce free-text search to reduce request chatter and improve UX
  const [debouncedQ, setDebouncedQ] = useState(state.q ?? '')
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(state.q ?? ''), 300)
    return () => clearTimeout(handle)
  }, [state.q])

  const urlState = useMemo(() => ({
    listingId: state.listingId,
    channel: state.channel,
    type: state.type,
    status: state.status,
    approved: state.approved,
    minRating: state.minRating,
    maxRating: state.maxRating,
    from: state.from,
    to: state.to,
  }), [state.listingId, state.channel, state.type, state.status, state.approved, state.minRating, state.maxRating, state.from, state.to])

  useEffect(() => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(urlState)) {
      if (v == null || v === '') continue
      sp.set(k, String(v))
    }
    if (debouncedQ && debouncedQ.trim().length >= 1) sp.set('q', debouncedQ.trim())
    const nextUrl = `${pathname}?${sp.toString()}` as unknown as Route
    router.replace(nextUrl)
  }, [urlState, debouncedQ, router, pathname])

  // Persist entire filter state
  useEffect(() => {
    try {
      localStorage.setItem('flex-reviews:filters', JSON.stringify(state))
    } catch {}
  }, [state])

  const set = (k: keyof Filters, v: any) => setState((s) => ({ ...s, [k]: v }))

  const ratingLabel = useMemo(() => {
    const min = state.minRating ?? 0
    const max = state.maxRating ?? 10
    return `${min} – ${max}`
  }, [state.minRating, state.maxRating])

  return (
    <div className="card grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="text-sm">Search</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            aria-label="Search"
            className="input flex-1"
            placeholder="Text, author, or listing"
            value={state.q ?? ''}
            onChange={(e) => set('q', e.target.value)}
          />
          {state.q ? (
            <button className="btn btn-secondary" aria-label="Clear search" onClick={() => set('q', '')}>
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <label className="text-sm">Channel</label>
        <select
          aria-label="Channel"
          className="input mt-1"
          value={state.channel ?? ''}
          onChange={(e) => set('channel', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option>Hostaway</option>
          <option>Airbnb</option>
          <option>Booking</option>
          <option>Google</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Approval</label>
        <select
          aria-label="Approval"
          className="input mt-1"
          value={state.approved ?? ''}
          onChange={(e) => set('approved', (e.target.value as any) || undefined)}
        >
          <option value="">All</option>
          <option value="true">Approved</option>
          <option value="false">Not Approved</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Type</label>
        <select
          aria-label="Type"
          className="input mt-1"
          value={state.type ?? ''}
          onChange={(e) => set('type', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="guest-to-host">guest-to-host</option>
          <option value="host-to-guest">host-to-guest</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Status</label>
        <select
          aria-label="Status"
          className="input mt-1"
          value={state.status ?? ''}
          onChange={(e) => set('status', e.target.value || undefined)}
        >
          <option value="">All</option>
          <option>published</option>
        </select>
      </div>
      <div>
        <label className="text-sm">Rating range (0–10)</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            aria-label="Min rating"
            className="input"
            type="number"
            min={0}
            max={10}
            step={1}
            value={state.minRating ?? ''}
            onChange={(e) => set('minRating', e.target.value ? Number(e.target.value) : undefined)}
          />
          <span>to</span>
          <input
            aria-label="Max rating"
            className="input"
            type="number"
            min={0}
            max={10}
            step={1}
            value={state.maxRating ?? ''}
            onChange={(e) => set('maxRating', e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-xs text-muted-foreground">{ratingLabel}</span>
        </div>
      </div>
      <div>
        <label className="text-sm">From</label>
        <input
          aria-label="From date"
          className="input mt-1"
          type="date"
          value={state.from ?? ''}
          onChange={(e) => set('from', e.target.value || undefined)}
        />
      </div>
      <div>
        <label className="text-sm">To</label>
        <input
          aria-label="To date"
          className="input mt-1"
          type="date"
          value={state.to ?? ''}
          onChange={(e) => set('to', e.target.value || undefined)}
        />
      </div>
      <div className="flex items-end">
        <button
          className="btn btn-secondary w-full"
          aria-label="Reset filters"
          onClick={() => {
            setState({ q: '', channel: undefined, type: undefined, status: undefined, approved: undefined, minRating: undefined, maxRating: undefined, from: undefined, to: undefined, listingId: undefined })
          }}
        >
          Reset filters
        </button>
      </div>
      <div className="col-span-full -mt-2 flex flex-wrap gap-2">
        {renderChips(state, (k) => set(k as keyof Filters, undefined))}
      </div>
    </div>
  )
}

function renderChips(state: Filters, clear: (k: string) => void) {
  const chips: Array<{ k: keyof Filters; label: string }> = []
  const push = (k: keyof Filters, label: string) => chips.push({ k, label })
  if (state.q) push('q', `q: ${state.q}`)
  if (state.channel) push('channel', `channel: ${state.channel}`)
  if (state.type) push('type', `type: ${state.type}`)
  if (state.status) push('status', `status: ${state.status}`)
  if (state.approved) push('approved', `approved: ${state.approved}`)
  if (state.minRating != null) push('minRating', `min: ${state.minRating}`)
  if (state.maxRating != null) push('maxRating', `max: ${state.maxRating}`)
  if (state.from) push('from', `from: ${state.from}`)
  if (state.to) push('to', `to: ${state.to}`)
  if (state.listingId) push('listingId', 'listing: selected')

  if (!chips.length) return null
  return chips.map(({ k, label }) => (
    <span key={String(k)} className="inline-flex items-center gap-2 rounded bg-secondary px-2 py-1 text-xs">
      {label}
      <button aria-label={`Clear ${String(k)}`} onClick={() => clear(String(k))} className="text-muted-foreground">×</button>
    </span>
  ))
}
