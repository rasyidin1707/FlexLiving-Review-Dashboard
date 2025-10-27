"use client"

import * as React from "react";
import type { ReviewRow } from "./types";

export type ReviewTableProps = {
  rows: ReviewRow[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (n: number) => void;
  onSelectRows?: (ids: string[]) => void;
  onToggleApprove?: (id: string, next: boolean) => void;
  onRowClick?: (row: ReviewRow) => void;
  activeCategories?: string[];
  onQuickCategorySelect?: (category: string) => void;
  pendingIds?: string[];
  pageSizeOptions?: number[];
  sortBy?: 'date' | 'rating' | 'listing' | '';
  sortDir?: 'asc' | 'desc';
  onSortChange?: (by: 'date' | 'rating' | 'listing', dir: 'asc' | 'desc') => void;
  clearSignal?: number; // bump this to programmatically clear selection
};

function ratingChipClass(v: number | null) {
  if (v == null) return "bg-gray-100 text-gray-700";
  if (v >= 8) return "bg-green-100 text-green-700";
  if (v >= 5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function ReviewTable({ rows, page, pageSize, total, onPageChange, onPageSizeChange, onSelectRows, onToggleApprove, onRowClick, activeCategories, onQuickCategorySelect, pendingIds, pageSizeOptions = [10,25,50], sortBy, sortDir = 'desc', onSortChange, clearSignal }: ReviewTableProps) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const allChecked = rows.length > 0 && selected.length === rows.length;
  const someChecked = selected.length > 0 && selected.length < rows.length;

  React.useEffect(() => {
    onSelectRows?.(selected);
  }, [selected, onSelectRows]);

  // Clear selection when parent bumps the signal (e.g., after bulk action)
  React.useEffect(() => {
    if (clearSignal != null) setSelected([]);
  }, [clearSignal]);

  function toggleAll(next: boolean) {
    setSelected(next ? rows.map((r) => r.id) : []);
  }

  function toggleOne(id: string, next: boolean) {
    setSelected((prev) => (next ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700 dark:text-gray-100">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 z-10">
            <tr>
              <th className="px-3 py-2 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allChecked}
                  aria-checked={someChecked ? "mixed" : allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2 text-left">Approve</th>
              <th className="px-3 py-2 text-left">
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onSortChange?.('listing', sortBy==='listing' && sortDir==='asc' ? 'desc' : 'asc')} aria-label="Sort by listing">
                  Listing {sortBy==='listing' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">Channel</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onSortChange?.('rating', sortBy==='rating' && sortDir==='asc' ? 'desc' : 'asc')} aria-label="Sort by rating">
                  Rating {sortBy==='rating' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">Categories</th>
              <th className="px-3 py-2 text-left">Review</th>
              <th className="px-3 py-2 text-left">Author</th>
              <th className="px-3 py-2 text-left">
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onSortChange?.('date', sortBy==='date' && sortDir==='asc' ? 'desc' : 'asc')} aria-label="Sort by date">
                  Date {sortBy==='date' ? (sortDir==='asc' ? '↑' : '↓') : ''}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => onRowClick?.(r)}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selected.includes(r.id)}
                    onChange={(e) => toggleOne(r.id, e.target.checked)}
                    aria-label={`Select ${r.id}`}
                  />
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleApprove?.(r.id, !r.approved);
                      }}
                      role="switch"
                      aria-checked={r.approved}
                      aria-label={`Approve ${r.id}`}
                      title={r.approved ? "Approved — click to unapprove" : "Not approved — click to approve"}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleApprove?.(r.id, !r.approved);
                        }
                      }}
                      className={`relative inline-flex h-6 w-10 flex-shrink-0 items-center rounded-full transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${r.approved ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} ${(pendingIds||[]).includes(r.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={(pendingIds||[]).includes(r.id)}
                      aria-busy={(pendingIds||[]).includes(r.id)}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-150 ease-out ${r.approved ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                      {(pendingIds||[]).includes(r.id) ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                        </span>
                      ) : null}
                    </button>
                    {r.approved ? (
                      <button
                        type="button"
                        className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                        title="Click to unapprove"
                        aria-label="Unapprove"
                        onClick={(e) => { e.stopPropagation(); onToggleApprove?.(r.id, false); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onToggleApprove?.(r.id, false); } }}
                      >
                        Approved
                      </button>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.listingName}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.channel}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.type ?? "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.status ?? "-"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${ratingChipClass(r.ratingOverall)}`}>
                    {r.ratingOverall ?? "-"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.ratingItems
                      ? Object.entries(r.ratingItems)
                          .filter(([, v]) => typeof v === "number")
                          .slice(0, 4)
                          .map(([k, v]) => {
                            const active = (activeCategories || []).includes(String(k).toLowerCase())
                            return (
                              <button
                                key={k}
                                type="button"
                                className={`rounded px-2 py-0.5 text-xs ${ratingChipClass(v as number)} ${onQuickCategorySelect ? 'cursor-pointer hover:ring-1 hover:ring-indigo-400' : ''} ${active ? 'ring-2 ring-indigo-500' : ''}`}
                                title={`Filter by ${k}`}
                                onClick={(e) => { e.stopPropagation(); onQuickCategorySelect?.(String(k)); }}
                                aria-label={`Filter by category ${k}`}
                              >
                                {k}: {v as number}
                              </button>
                            )
                          })
                      : null}
                  </div>
                </td>
                <td className="px-3 py-2 max-w-[320px]">
                  <div className="truncate" title={r.publicText || "-"}>{r.publicText ?? "-"}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{r.authorName ?? "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={11}>
                  No reviews found for current filters
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-300">
          Page {page} of {totalPages} • {total} total
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-300 inline-flex items-center gap-1">
            Show
            <select
              className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 text-xs px-2 py-1"
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-all"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              Prev
            </button>
            <button
              className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
