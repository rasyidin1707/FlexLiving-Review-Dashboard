"use client"

import { Fragment, useEffect, useState, useCallback } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'

export function ActivityLog() {
  const [items, setItems] = useState<any[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(0)
  const [action, setAction] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return
    if (!reset && nextOffset == null) return
    setLoading(true)
    try {
      const offset = reset ? 0 : nextOffset ?? 0
      const url = new URL('/api/activity', window.location.origin)
      url.searchParams.set('limit', '20')
      url.searchParams.set('offset', String(offset))
      if (action) url.searchParams.set('action', action)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to load activity')
      let json: any
      try {
        json = await res.json()
      } catch {
        json = { items: [], nextOffset: null }
      }
      setItems((prev) => (reset ? json.items : [...prev, ...json.items]))
      setNextOffset(json.nextOffset)
    } catch (e) {
      // swallow error; keep current list
      setNextOffset(null)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action])

  useEffect(() => {
    loadMore(true)
  }, [action, loadMore])

  // Refresh the activity log whenever review data changes elsewhere
  useEffect(() => {
    const handler = () => loadMore(true)
    window.addEventListener('invalidate-reviews', handler as any)
    return () => window.removeEventListener('invalidate-reviews', handler as any)
  }, [loadMore])

  const options: Array<{ value: string; label: string }> = [
    { value: '', label: 'All actions' },
    { value: 'approve', label: 'Approve' },
    { value: 'unapprove', label: 'Unapprove' },
    { value: 'auto-approve', label: 'Auto-approve' },
  ]

  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Activity Log</div>
        <Listbox value={action} onChange={(v) => setAction(v)}>
          {({ open }) => (
            <div className="relative w-48">
              <Listbox.Button className="input w-full text-left pr-8">
                <span>{options.find((o) => o.value === action)?.label ?? 'All actions'}</span>
                <ChevronDown size={16} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-150 motion-reduce:transition-none"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100 motion-reduce:transition-none"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Listbox.Options className="absolute right-0 z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-card py-1 text-sm shadow-lg focus:outline-none">
                  {options.map((opt) => (
                    <Listbox.Option
                      key={opt.value || 'all'}
                      value={opt.value}
                      className={({ active, selected }) => `flex cursor-pointer select-none items-center gap-2 px-3 py-2 ${active ? 'bg-muted' : ''}`}
                    >
                      {({ selected }) => (
                        <>
                          <Check size={14} className={`text-primary ${selected ? 'opacity-100' : 'opacity-0'}`} />
                          <span>{opt.label}</span>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Listing</th>
              <th className="p-2 text-left">Review</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i: any) => (
              <tr key={i.id} className="border-b">
                <td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
                <td className="p-2">{i.action}</td>
                <td className="p-2">{i.listingName}</td>
                <td className="p-2">{i.reviewId.slice(0, 8)}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="p-2 text-muted-foreground" colSpan={4}>No activity yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button className="btn btn-secondary" onClick={() => loadMore(true)} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        {nextOffset != null ? (
          <button className="btn btn-secondary" onClick={() => loadMore()} disabled={loading}>
            {loading ? 'Loading…' : 'Show more'}
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">End of activity</span>
        )}
      </div>
    </div>
  )
}
