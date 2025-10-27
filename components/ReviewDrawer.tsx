"use client"

import { Fragment, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'

type Props = {
  open: boolean
  onClose: () => void
  review: null | {
    id: string
    listingName: string
    authorName: string | null
    publicText: string | null
    ratingOverall: number | null
    ratingItems: Record<string, number> | null
    channel: string | null
    type: string | null
    status: string | null
    submittedAt: string | null
    approved: boolean
  }
  tokens: string[]
  onToggleApprove: (id: string, next: boolean) => void
}

import { Highlight } from '@/components/Highlight'
import toast from 'react-hot-toast'

export function ReviewDrawer({ open, onClose, review, tokens, onToggleApprove }: Props) {
  const initialRef = useRef<HTMLButtonElement>(null)

  return (
    <Transition show={open && !!review} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50" initialFocus={initialRef}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-150 motion-reduce:transition-none"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-100 motion-reduce:transition-none"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-out duration-200 motion-reduce:transition-none"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in duration-150 motion-reduce:transition-none"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="ml-auto h-full w-full max-w-md overflow-y-auto bg-card p-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{review?.listingName}</div>
                  <Dialog.Title className="text-lg font-semibold">
                    <Highlight text={review?.authorName ?? 'Unknown guest'} tokens={tokens} />
                  </Dialog.Title>
                </div>
                <button ref={initialRef} className="btn btn-secondary" onClick={onClose} aria-label="Close">
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="text-xl">{review?.ratingOverall ?? '—'}/10</div>
                </div>
                {review?.ratingItems && (
                  <div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(review.ratingItems).map(([k, v]) => (
                        <span key={k} className={`rounded-md px-2 py-1 text-xs ${scoreColor(v)}`}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Channel</div>
                  <div>
                    <Highlight text={review?.channel ?? '—'} tokens={tokens} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div>
                      <Highlight text={review?.type ?? '—'} tokens={tokens} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{review?.status ?? '—'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div>{review?.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Review</div>
                  <p className="whitespace-pre-wrap">
                    <Highlight text={review?.publicText ?? '—'} tokens={tokens} />
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  className="btn"
                  onClick={() => {
                    if (!review) return
                    onToggleApprove(review.id, !review.approved)
                    toast.success(`Review ${!review.approved ? 'approved' : 'unapproved'} successfully`)
                  }}
                  aria-label="Toggle approve"
                >
                  {review?.approved ? 'Unapprove' : 'Approve'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

function scoreColor(v: number | null) {
  if (v == null) return 'bg-muted text-muted-foreground'
  if (v >= 8) return 'bg-green-100 text-green-800'
  if (v >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
