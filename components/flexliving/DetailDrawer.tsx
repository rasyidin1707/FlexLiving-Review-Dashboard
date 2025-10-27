"use client"

import * as React from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { ReviewRow } from "./types";

export default function DetailDrawer({
  open,
  onClose,
  review,
  onToggleApprove,
}: {
  open: boolean;
  onClose: () => void;
  review?: ReviewRow;
  onToggleApprove?: (id: string, next: boolean) => void;
}) {
  return (
    <Transition show={open && !!review} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">{review?.listingName}</div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {review?.authorName ?? "Unknown guest"}
                  </Dialog.Title>
                </div>
                <button
                  className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-all"
                  onClick={onClose}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Rating</div>
                  <div className="text-xl text-gray-900">{review?.ratingOverall ?? "-"}/10</div>
                </div>
                {review?.ratingItems && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Categories</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(review.ratingItems).map(([k, v]) => (
                        <span key={k} className={`rounded-md px-2 py-1 text-xs ${scoreColor(v as number | null)}`}>
                          {k}: {v as number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Channel</div>
                    <div>{review?.channel ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Type</div>
                    <div>{review?.type ?? "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                    <div>{review?.status ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                    <div>{review?.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : "-"}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Review Text</div>
                  <p className="whitespace-pre-wrap">{review?.publicText ?? "-"}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all"
                  onClick={() => review && onToggleApprove?.(review.id, !review.approved)}
                  aria-label="Toggle approve"
                >
                  {review?.approved ? "Unapprove" : "Approve"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function scoreColor(v: number | null) {
  if (v == null) return "bg-gray-100 text-gray-700";
  if (v >= 8) return "bg-green-100 text-green-700";
  if (v >= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

