"use client"

import { useEffect, useMemo, useState } from 'react'

type ReviewRow = {
  id: string
  listingId: string
  listingName: string
  source: string
  sourceReviewId: string | null
  type: string | null
  status: string | null
  channel: string | null
  ratingOverall: number | null
  ratingItems: Record<string, number> | null
  publicText: string | null
  submittedAt: string | null
  authorName: string | null
  approved: boolean
}

type Props = {
  rows: ReviewRow[]
  tokens: string[]
  total: number
  page: number
  perPage: number
  onToggleApprove: (id: string, next: boolean) => void
  onOpenDetails: (row: ReviewRow) => void
}

import { Highlight } from '@/components/Highlight'
import { downloadCsv, downloadPdfSummary, downloadPdfSummaryForFilters } from '@/lib/export'
import { ExportMenu } from '@/components/ExportMenu'
import toast from 'react-hot-toast'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function ReviewTable({ rows, tokens, total, page, perPage, onToggleApprove, onOpenDetails }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [sort, setSort] = useState<{ key: 'date' | 'rating' | 'listing'; dir: 'asc' | 'desc' }>(
    { key: 'date', dir: 'desc' },
  )
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  useEffect(() => setSelected({}), [rows])

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    for (const r of rows) next[r.id] = checked
    setSelected(next)
  }

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      switch (sort.key) {
        case 'rating':
          return (a.ratingOverall ?? -1) - (b.ratingOverall ?? -1)
        case 'listing':
          return a.listingName.localeCompare(b.listingName)
        case 'date':
        default:
          return (new Date(a.submittedAt || 0).getTime() || 0) - (new Date(b.submittedAt || 0).getTime() || 0)
      }
    })
    if (sort.dir === 'desc') copy.reverse()
    return copy
  }, [rows, sort])

  return (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Showing {rows.length ? (page - 1) * perPage + 1 : 0}–
          {(page - 1) * perPage + rows.length} of {total} result(s)
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => selectedIds.length && bulk(selectedIds, true, onToggleApprove)}
            aria-label="Approve selected"
          >
            Approve selected
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => selectedIds.length && bulk(selectedIds, false, onToggleApprove)}
            aria-label="Unapprove selected"
          >
            Unapprove selected
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm">Sort</span>
            <select
              aria-label="Sort key"
              className="input"
              value={sort.key}
              onChange={(e) => setSort((s) => ({ ...s, key: e.target.value as any }))}
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
              <option value="listing">Listing</option>
            </select>
            <select
              aria-label="Sort direction"
              className="input"
              value={sort.dir}
              onChange={(e) => setSort((s) => ({ ...s, dir: e.target.value as any }))}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div className="hidden h-6 w-px bg-border md:block" />
          <ExportMenu
            onCsv={() => exportAllCsv(params)}
            onPdfClient={() => exportAllPdf(params)}
            onPdfServer={() => exportAllPdfServer(params)}
          />
          <div className="hidden h-6 w-px bg-border md:block" />
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => changePage(Math.max(1, page - 1), perPage, router, pathname, params)}
              aria-label="Previous page"
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm">Page {page}</span>
            <button
              className="btn btn-secondary"
              onClick={() => changePage(page + 1, perPage, router, pathname, params)}
              aria-label="Next page"
              disabled={(page * perPage) >= total}
            >
              Next
            </button>
            <select
              aria-label="Per page"
              className="input"
              value={String(perPage)}
              onChange={(e) => changePage(1, Number(e.target.value), router, pathname, params)}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-700">
              <th className="p-2">
                <input
                  aria-label="Select all"
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="p-2">Approve</th>
              <th className="p-2">Listing</th>
              <th className="p-2">Channel</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Key categories</th>
              <th className="p-2">Review</th>
              <th className="p-2">Author</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-2 align-top">
                  <input
                    aria-label={`Select ${r.id}`}
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))}
                  />
                </td>
                <td className="p-2 align-top">
                  <label className="switch" aria-label={`Approve ${r.id}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={r.approved}
                      onChange={() => onToggleApprove(r.id, !r.approved)}
                    />
                    <span className={`switch-dot ${r.approved ? 'translate-x-4' : 'translate-x-1'}`}></span>
                  </label>
                </td>
                <td className="p-2 align-top">
                  <Highlight text={r.listingName} tokens={tokens} />
                </td>
                <td className="p-2 align-top">
                  <Highlight text={r.channel ?? '—'} tokens={tokens} />
                </td>
                <td className="p-2 align-top">
                  <Highlight text={r.type ?? '—'} tokens={tokens} />
                </td>
                <td className="p-2 align-top">{r.status ?? '—'}</td>
                <td className="p-2 align-top">
                  <span className={`rounded px-2 py-0.5 ${scoreColor(r.ratingOverall)}`}>
                    {r.ratingOverall ?? '—'}
                  </span>
                </td>
                <td className="p-2 align-top">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {r.ratingItems ? (
                      Object.entries(r.ratingItems).map(([k, v]) => (
                        <span key={k} className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                          {k}: {v}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="p-2 align-top max-w-[400px]">
                  <button
                    className="text-left underline underline-offset-2"
                    onClick={() => onOpenDetails(r)}
                    aria-label="Open details"
                    title={r.publicText ?? ''}
                  >
                    {r.publicText ? (
                      <span className="line-clamp-2">
                        <Highlight text={r.publicText} tokens={tokens} />
                      </span>
                    ) : (
                      '—'
                    )}
                  </button>
                </td>
                <td className="p-2 align-top">
                  <Highlight text={r.authorName ?? '—'} tokens={tokens} />
                </td>
                <td className="p-2 align-top">
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

async function bulk(ids: string[], approved: boolean, toggle: (id: string, next: boolean) => void) {
  for (const id of ids) toggle(id, approved)
  await fetch('/api/reviews/approve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ids, approved }),
  })
  toast.success(`${ids.length} review${ids.length === 1 ? '' : 's'} ${approved ? 'approved' : 'unapproved'} successfully`)
  window.dispatchEvent(new CustomEvent('invalidate-reviews'))
}

function changePage(page: number, perPage: number, router: any, pathname: string, params: URLSearchParams) {
  const sp = new URLSearchParams(params.toString())
  sp.set('page', String(page))
  sp.set('perPage', String(perPage))
  router.replace(`${pathname}?${sp.toString()}`)
}

function scoreColor(v: number | null) {
  if (v == null) return 'bg-muted text-muted-foreground'
  if (v >= 8) return 'bg-green-100 text-green-800'
  if (v >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

async function exportAllCsv(params: URLSearchParams) {
  try {
    const sp = new URLSearchParams(params.toString())
    sp.delete('page')
    sp.delete('perPage')
    const res = await fetch(`/api/reviews/export?${sp.toString()}`)
    if (!res.ok) throw new Error('Export failed')
    const text = await res.text()
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFileName('csv', sp)
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported for all filtered reviews')
  } catch (e) {
    toast.error('Failed to export CSV')
  }
}

async function exportAllPdf(params: URLSearchParams) {
  try {
    await downloadPdfSummaryForFilters(buildFileName('pdf_charts', params), params)
    toast.success('PDF summary exported for all filtered reviews')
  } catch (e) {
    toast.error('Failed to export PDF')
  }
}

async function exportAllPdfServer(params: URLSearchParams) {
  try {
    const sp = new URLSearchParams(params.toString())
    sp.delete('page'); sp.delete('perPage')
    const res = await fetch(`/api/reviews/export-pdf?${sp.toString()}`)
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFileName('pdf_summary', sp)
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Server PDF exported for all filtered reviews')
  } catch (e) {
    toast.error('Failed to export server PDF')
  }
}

function buildFileName(prefix: 'csv' | 'pdf_charts' | 'pdf_summary', sp: URLSearchParams) {
  // Prefer query text; else listingId; else 'overall'
  const q = sp.get('q')?.trim()
  const listing = sp.get('listingId')
  const focus = q ? q.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 20) : listing ? `listing-${listing.slice(0, 6)}` : 'overall'
  const stamp = new Date().toISOString().slice(0, 10)
  const nameMap: Record<string, string> = {
    csv: `reviews_export(${focus})_${stamp}.csv`,
    pdf_charts: `pdf_charts(${focus})_${stamp}.pdf`,
    pdf_summary: `pdf_summary(${focus})_${stamp}.pdf`,
  }
  return nameMap[prefix]
}
