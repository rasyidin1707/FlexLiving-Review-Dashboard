"use client"

import * as React from "react";
import type { Channel } from "./types";

export type FilterBarProps = {
  listings: { id: string; name: string }[];
  channels: Channel[];
  values: {
    listingId?: string;
    channel?: Channel | "All";
    type?: string | "All";
    status?: string | "All";
    approved?: "All" | "Approved" | "NotApproved";
    ratingMin: number;
    ratingMax: number;
    dateFrom?: string;
    dateTo?: string;
    q?: string;
    categories?: string; // comma-separated
    catMin?: number;
    keywords?: string; // comma-separated
  };
  onChange: (next: FilterBarProps["values"]) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export default function FilterBar({ listings, channels, values, onChange, onSubmit, onReset }: FilterBarProps) {
  function set<K extends keyof FilterBarProps["values"]>(key: K, val: FilterBarProps["values"][K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 dark:text-gray-100">
      <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Listing</label>
          <select
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.listingId || ""}
            onChange={(e) => set("listingId", e.target.value || undefined)}
            aria-label="Filter by listing"
          >
            <option value="">All</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Channel</label>
          <select
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={(values.channel as string) || "All"}
            onChange={(e) => set("channel", (e.target.value as Channel | "All") || "All")}
            aria-label="Filter by channel"
          >
            <option value="All">All</option>
            {channels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Type</label>
          <select
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.type || "All"}
            onChange={(e) => set("type", (e.target.value as string | "All") || "All")}
            aria-label="Filter by type"
          >
            <option value="All">All</option>
            <option value="guest-to-host">guest-to-host</option>
            <option value="host-to-guest">host-to-guest</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</label>
          <select
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.status || "All"}
            onChange={(e) => set("status", (e.target.value as string | "All") || "All")}
            aria-label="Filter by status"
          >
            <option value="All">All</option>
            <option value="published">published</option>
            <option value="pending">pending</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Approved</label>
          <select
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.approved || "All"}
            onChange={(e) => set("approved", (e.target.value as "All" | "Approved" | "NotApproved") || "All")}
            aria-label="Filter by approval"
          >
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="NotApproved">NotApproved</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Rating min</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.ratingMin}
              onChange={(e) => set("ratingMin", Number(e.target.value))}
              aria-label="Rating minimum"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Rating max</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.ratingMax}
              onChange={(e) => set("ratingMax", Number(e.target.value))}
              aria-label="Rating maximum"
            />
          </div>
        </div>

      <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">From</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.dateFrom || ""}
              onChange={(e) => set("dateFrom", e.target.value || undefined)}
              aria-label="Date from"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">To</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={values.dateTo || ""}
              onChange={(e) => set("dateTo", e.target.value || undefined)}
              aria-label="Date to"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Categories (comma)</label>
          <input
            type="text"
            placeholder="cleanliness,communication"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.categories || ""}
            onChange={(e) => set("categories", e.target.value)}
            aria-label="Category names"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Category min</label>
          <input
            type="number"
            min={0}
            max={10}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.catMin ?? 0}
            onChange={(e) => set("catMin", Number(e.target.value))}
            aria-label="Category minimum score"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Keywords (comma)</label>
          <input
            type="text"
            placeholder="quiet,clean"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.keywords || ""}
            onChange={(e) => set("keywords", e.target.value)}
            aria-label="Keywords"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Search</label>
          <input
            type="text"
            placeholder="Search author or text"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={values.q || ""}
            onChange={(e) => set("q", e.target.value)}
            aria-label="Search"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all"
          onClick={onSubmit}
          aria-label="Run now"
        >
          Run now
        </button>
        <button
          className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          onClick={onReset}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
