"use client"

import * as React from "react";
import FilterBar from "@/components/flexliving/FilterBar";
import StatCard from "@/components/flexliving/StatCard";
import ChartCard from "@/components/flexliving/ChartCard";
import AverageRatingLineChart from "@/components/flexliving/AverageRatingLineChart";
import ChannelBarChart from "@/components/flexliving/ChannelBarChart";
import SentimentTrendChart from "@/components/flexliving/SentimentTrendChart";
import ReviewSourceDonut from "@/components/flexliving/ReviewSourceDonut";
import RatingSentimentScatter from "@/components/flexliving/RatingSentimentScatter";
import InsightsPanel from "@/components/flexliving/InsightsPanel";
import IssuesKeywordsPanel from "@/components/flexliving/IssuesKeywordsPanel";
import RadarInsightsChart from "@/components/flexliving/RadarInsightsChart";
import ReviewTable from "@/components/flexliving/ReviewTable";
import ListingCard from "@/components/flexliving/ListingCard";
import DetailDrawer from "@/components/flexliving/DetailDrawer";
import BulkActionToolbar from "@/components/flexliving/BulkActionToolbar";
import ListingComparisonPanel from "@/components/flexliving/ListingComparisonPanel";
import { exportReviewsToCSV, triggerDownload } from "@/lib/export/exportReviewsToCSV";
import { exportDashboardToPDF } from "@/lib/export/exportDashboardToPDF";
import type { Channel, ListingSummary, ReviewRow, RatingItems } from "@/components/flexliving/types";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/flexliving/Header";

type Filters = {
  listingId?: string;
  channel?: Channel | "All";
  channels?: Channel[];
  type?: string | "All";
  status?: string | "All";
  approved?: "All" | "Approved" | "NotApproved";
  ratingMin: number;
  ratingMax: number;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
  categories?: string;
  catMin?: number;
  keywords?: string;
  sortBy?: 'date' | 'rating' | 'listing' | '';
  sortDir?: 'asc' | 'desc';
};

export default function FlexDemoPage() {
  const router = useRouter();
  const [listings, setListings] = React.useState<ListingSummary[]>([]);
  const [rows, setRows] = React.useState<ReviewRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [insights, setInsights] = React.useState({ topIssues: [] as string[], keywords: [] as Array<{ term: string; count: number }>, sentiment: { positive: 0, neutral: 0, negative: 0 }, categoryAverages: {} as Record<string, number> });
  const [sentimentHistory, setSentimentHistory] = React.useState<Array<{ month: string; positive: number; neutral: number; negative: number }>>([]);
  const [channelBreakdown, setChannelBreakdown] = React.useState<Array<{ channel: Channel; count: number }>>([]);
  const [topIssueTrends, setTopIssueTrends] = React.useState<Record<string, number[]>>({});
  const [filters, setFilters] = React.useState<Filters>({ ratingMin: 0, ratingMax: 10, approved: "All" });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeReview, setActiveReview] = React.useState<ReviewRow | undefined>(undefined);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [pendingIds, setPendingIds] = React.useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [loadingRows, setLoadingRows] = React.useState(false);
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const [clearSignal, setClearSignal] = React.useState(0);

  // theme persistence
  React.useEffect(() => {
    try {
      const pref = localStorage.getItem('theme');
      const root = document.documentElement;
      if (pref === 'dark') root.classList.add('dark');
      if (pref === 'light') root.classList.remove('dark');
    } catch {}
  }, []);

  const loadListings = React.useCallback(() => {
    return fetch("/api/listings")
      .then((r) => r.json())
      .then((d) => {
        const mapped: ListingSummary[] = (d.items || []).map((it: any) => ({
          id: it.listingId,
          name: it.listingName,
          total: it.reviewCounts?.total ?? 0,
          approved: it.reviewCounts?.approved ?? 0,
          avgAll: it.avgRatingAll ?? null,
          avgApproved: it.avgRatingApproved ?? null,
          monthlySeries: [],
        }))
        setListings(mapped)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    loadListings()
  }, [loadListings])

  // Hydrate filters/page from URL first, then fallback to localStorage snapshot
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const get = (k: string) => url.searchParams.get(k);
      const initial: Partial<Filters> = {};
      if (get('listingId')) initial.listingId = get('listingId') || undefined;
      if (get('channel')) initial.channel = (get('channel') as Channel) || undefined;
      if (get('type')) initial.type = (get('type') as any) || undefined;
      if (get('status')) initial.status = (get('status') as any) || undefined;
      if (get('approved') === 'true') initial.approved = 'Approved';
      else if (get('approved') === 'false') initial.approved = 'NotApproved';
      if (get('channels')) initial.channels = (get('channels') || '').split(',').filter(Boolean) as Channel[];
      if (get('minRating')) initial.ratingMin = Number(get('minRating')) || 0;
      if (get('maxRating')) initial.ratingMax = Number(get('maxRating')) || 10;
      if (get('from')) initial.dateFrom = get('from') || undefined;
      if (get('to')) initial.dateTo = get('to') || undefined;
      if (get('q')) initial.q = get('q') || '';
      if (get('categories')) initial.categories = get('categories') || undefined;
      if (get('catMin')) initial.catMin = Number(get('catMin')) || undefined;
      if (get('keywords')) initial.keywords = get('keywords') || undefined;
      if (get('sortBy')) initial.sortBy = get('sortBy') as any;
      if (get('sortDir')) initial.sortDir = (get('sortDir') as any) || 'desc';
      const p = get('page');
      const pp = get('perPage');
      if (p) setPage(Math.max(1, Number(p)));
      if (pp) setPageSize(Math.min(100, Math.max(1, Number(pp))));

      const filled = Object.keys(initial).length > 0;
      if (filled) {
        setFilters((prev) => ({ ...prev, ...initial } as Filters));
      } else {
        const snap = localStorage.getItem('flex:filters');
        if (snap) {
          const parsed = JSON.parse(snap);
          setFilters((prev) => ({ ...prev, ...parsed } as Filters));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildQuery = React.useCallback(() => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.listingId) sp.set("listingId", filters.listingId);
    if (filters.channels && filters.channels.length) sp.set('channels', (filters.channels as string[]).join(','));
    else if (filters.channel && filters.channel !== "All") sp.set("channel", String(filters.channel));
    if (filters.type && filters.type !== "All") sp.set("type", String(filters.type));
    if (filters.status && filters.status !== "All") sp.set("status", String(filters.status));
    if (filters.approved === "Approved") sp.set("approved", "true");
    if (filters.approved === "NotApproved") sp.set("approved", "false");
    sp.set("minRating", String(filters.ratingMin));
    sp.set("maxRating", String(filters.ratingMax));
    if (filters.dateFrom) sp.set("from", filters.dateFrom);
    if (filters.dateTo) sp.set("to", filters.dateTo);
    if (filters.categories) sp.set("categories", filters.categories);
    if (typeof filters.catMin === 'number') sp.set("catMin", String(filters.catMin));
    if (filters.keywords) sp.set("keywords", filters.keywords);
    if (filters.sortBy) sp.set('sortBy', String(filters.sortBy));
    if (filters.sortDir) sp.set('sortDir', String(filters.sortDir));
    sp.set("page", String(page));
    sp.set("perPage", String(pageSize));
    return sp.toString();
  }, [filters, page, pageSize]);

  // Aggressive URL + localStorage persistence with debounce
  const urlSyncRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    try { localStorage.setItem('flex:filters', JSON.stringify(filters)); } catch {}
    const qs = buildQuery();
    if (urlSyncRef.current) window.clearTimeout(urlSyncRef.current);
    urlSyncRef.current = window.setTimeout(() => {
      router.replace(`/dashboard?${qs}`);
    }, 200);
    return () => { if (urlSyncRef.current) window.clearTimeout(urlSyncRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, pageSize]);

  const loadReviews = React.useCallback(() => {
    const q = buildQuery();
    setLoadingRows(true);
    fetch(`/api/reviews?${q}`)
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setRows(items.map((r:any)=>({
          id: r.id,
          listingId: r.listingId,
          listingName: r.listingName,
          channel: r.channel,
          type: r.type,
          status: r.status,
          ratingOverall: r.ratingOverall,
          ratingItems: r.ratingItems,
          publicText: r.publicText,
          authorName: r.authorName,
          submittedAt: r.submittedAt,
          approved: r.approved,
          sentimentScore: r.sentimentScore,
        })));
        setTotal(d.total || 0);
      })
      .catch(()=>{ toast.error("Failed to load reviews"); })
      .finally(()=> setLoadingRows(false));
  }, [buildQuery]);

  // Persist selection (localStorage) and revive upon data load
  React.useEffect(() => {
    try { localStorage.setItem('flex:selected', JSON.stringify(selectedIds)); } catch {}
  }, [selectedIds]);

  React.useEffect(() => {
    try {
      const snap = localStorage.getItem('flex:selected');
      if (!snap) return;
      const arr: string[] = JSON.parse(snap);
      const ids = new Set(rows.map(r => r.id));
      const revived = arr.filter(id => ids.has(id));
      if (revived.length) setSelectedIds(revived);
    } catch {}
  }, [rows]);

  const reloadSummary = React.useCallback(() => {
    const sp = new URLSearchParams(buildQuery());
    sp.delete('page'); sp.delete('perPage');
    setLoadingSummary(true);
    fetch(`/api/reviews/summary?${sp.toString()}`)
      .then((r)=>r.json())
      .then((d)=>{
        // insights mapping
        const kwEntries = d.insights?.keywordFrequency ? Object.entries(d.insights.keywordFrequency) : [];
        setInsights({
          topIssues: d.insights?.topIssues || [],
          keywords: kwEntries.map(([term, count]: any) => ({ term: String(term), count: Number(count) })),
          sentiment: d.insights?.sentimentStats || { positive:0, neutral:0, negative:0 },
          categoryAverages: d.insights?.categoryAverages || {},
        });
        setLineData(Array.isArray(d.trend) ? d.trend : []);
        if (Array.isArray(d.channelBreakdown)) setChannelBreakdown(d.channelBreakdown);
        else if (d.byChannel) setChannelBreakdown(Object.entries(d.byChannel).map(([channel,count]: any[])=>({ channel, count })));
        setSentimentHistory(Array.isArray(d.sentimentHistory) ? d.sentimentHistory : []);
      })
      .catch(()=>{ toast.error("Failed to load summary"); })
      .finally(()=> { setLoadingSummary(false); loadListings(); });
  }, [buildQuery, loadListings]);

  React.useEffect(() => {
    loadReviews();
    reloadSummary();
  }, [loadReviews, reloadSummary]);

  // Auto-run export if ?export=csv|pdf present after first load
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const exp = url.searchParams.get('export');
    if (!exp) return;
    if (loadingRows || loadingSummary) return;
    if (exp === 'csv') {
      const csv = exportReviewsToCSV(rows);
      triggerDownload('reviews.csv', csv);
      toast.success('CSV exported');
    } else if (exp === 'pdf') {
      exportDashboardToPDF('dashboard-export');
      toast.success('PDF export started');
    }
    url.searchParams.delete('export');
    window.history.replaceState({}, '', url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRows, loadingSummary]);

  const channels: Channel[] = ["Hostaway", "Google", "Airbnb", "Booking", "Other"];

  // Aggregate stats based on current page rows (demo only)
  const totalApproved = rows.filter((r) => r.approved).length;
  const avgAll = rows.length ? (rows.reduce((a, r) => a + (r.ratingOverall ?? 0), 0) / rows.length).toFixed(2) : "-";
  const approvedRows = rows.filter((r) => r.approved && r.ratingOverall != null);
  const avgApproved = approvedRows.length ? (approvedRows.reduce((a, r) => a + (r.ratingOverall ?? 0), 0) / approvedRows.length).toFixed(2) : "-";

  const [lineData, setLineData] = React.useState<Array<{month:string; avg:number|null}>>([]);
  const channelData = channelBreakdown as Array<{channel: Channel; count: number}>;

  // theme toggle handled by Header/ThemeToggle

  return (
    <main id="dashboard-export" className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-6 dark:text-gray-100">
      <Header title="FlexLiving Demo Dashboard" />

      <FilterBar
        listings={listings.map((l) => ({ id: l.id, name: l.name }))}
        channels={channels}
        values={filters}
        onChange={(v) => setFilters(v)}
        onSubmit={() => {
          setPage(1);
          const qs = buildQuery();
          router.replace(`/dashboard?${qs}`);
          loadReviews();
          reloadSummary();
        }}
        onReset={() => {
          const next = { ratingMin: 0, ratingMax: 10, approved: "All" as const, categories: undefined as any, catMin: undefined as any, keywords: undefined as any, listingId: undefined as any, channel: "All" as any, type: "All" as any, status: "All" as any, q: "", dateFrom: undefined as any, dateTo: undefined as any };
          setFilters(next);
          setPage(1);
          router.replace(`/dashboard`);
          reloadSummary();
        }}
      />

      {(() => {
        const chips: Array<{ key: string; label: string; remove: () => void }> = [];
        const catList = (filters.categories || "").split(",").map((s) => s.trim()).filter(Boolean);
        const kwList = (filters.keywords || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (filters.listingId) {
          const name = listings.find((l) => l.id === filters.listingId)?.name || filters.listingId;
          chips.push({ key: "listingId", label: `Listing: ${name}` , remove: () => { setFilters({ ...filters, listingId: undefined }); setPage(1); } });
        }
        if (filters.channels && filters.channels.length) {
          chips.push({ key: 'channels', label: `Channels (${filters.channels.length})`, remove: () => { setFilters({ ...filters, channels: undefined }); setPage(1); } });
          for (const ch of filters.channels) chips.push({ key: `ch:${ch}`, label: `Channel: ${ch}`, remove: () => { const next = (filters.channels||[]).filter(x=>x!==ch) as Channel[]; setFilters({ ...filters, channels: next.length ? next : undefined }); setPage(1); } });
        } else if (filters.channel && filters.channel !== "All") chips.push({ key: "channel", label: `Channel: ${filters.channel}`, remove: () => { setFilters({ ...filters, channel: "All" }); setPage(1); } });
        if (filters.type && filters.type !== "All") chips.push({ key: "type", label: `Type: ${filters.type}`, remove: () => { setFilters({ ...filters, type: "All" }); setPage(1); } });
        if (filters.status && filters.status !== "All") chips.push({ key: "status", label: `Status: ${filters.status}`, remove: () => { setFilters({ ...filters, status: "All" }); setPage(1); } });
        if (filters.approved && filters.approved !== "All") chips.push({ key: "approved", label: `Approved: ${filters.approved}`, remove: () => { setFilters({ ...filters, approved: "All" }); setPage(1); } });
        if (filters.ratingMin !== 0) chips.push({ key: "ratingMin", label: `Min: ${filters.ratingMin}`, remove: () => { setFilters({ ...filters, ratingMin: 0 }); setPage(1); } });
        if (filters.ratingMax !== 10) chips.push({ key: "ratingMax", label: `Max: ${filters.ratingMax}`, remove: () => { setFilters({ ...filters, ratingMax: 10 }); setPage(1); } });
        if (filters.dateFrom) chips.push({ key: "dateFrom", label: `From: ${filters.dateFrom}`, remove: () => { setFilters({ ...filters, dateFrom: undefined }); setPage(1); } });
        if (filters.dateTo) chips.push({ key: "dateTo", label: `To: ${filters.dateTo}`, remove: () => { setFilters({ ...filters, dateTo: undefined }); setPage(1); } });
        if (filters.q && filters.q.trim()) chips.push({ key: "q", label: `Search: ${filters.q}`, remove: () => { setFilters({ ...filters, q: "" }); setPage(1); } });

        // Group chips with count badges (remove all in group)
        if (catList.length > 0) chips.push({ key: 'cats', label: `Categories (${catList.length})${typeof filters.catMin === 'number' ? ` ≥ ${filters.catMin}` : ''}`, remove: () => { setFilters({ ...filters, categories: undefined, catMin: undefined }); setPage(1); } })
        if (kwList.length > 0) chips.push({ key: 'kws', label: `Keywords (${kwList.length})`, remove: () => { setFilters({ ...filters, keywords: undefined }); setPage(1); } })

        // Individual category + keyword chips for granular removal
        for (const c of catList) chips.push({ key: `cat:${c}`, label: `Category: ${c}`, remove: () => {
          const rest = catList.filter((x) => x.toLowerCase() !== c.toLowerCase());
          setFilters({ ...filters, categories: rest.join(",") || undefined }); setPage(1);
        } });
        if (typeof filters.catMin === 'number' && catList.length > 0) chips.push({ key: "catMin", label: `Cat Min: ${filters.catMin}`, remove: () => { setFilters({ ...filters, catMin: undefined }); setPage(1); } });
        for (const k of kwList) chips.push({ key: `kw:${k}`, label: `Keyword: ${k}`, remove: () => {
          const rest = kwList.filter((x) => x.toLowerCase() !== k.toLowerCase());
          setFilters({ ...filters, keywords: rest.join(",") || undefined }); setPage(1);
        } });

        if (chips.length === 0) return null;
        return (
          <div className="sticky top-0 z-20 -mx-6 px-6 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => { c.remove(); }}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Remove ${c.label}`}
                title={c.label}
              >
                <span>{c.label}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => { try { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); } catch { } }}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
              aria-label="Copy link to current view"
              title="Copy link"
            >
              Copy link
            </button>
            <button
              onClick={() => { setFilters({ ratingMin: 0, ratingMax: 10, approved: "All", categories: undefined, catMin: undefined, keywords: undefined, listingId: undefined, channel: "All", type: "All", status: "All", q: "", dateFrom: undefined, dateTo: undefined }); setPage(1); }}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Reset all filters"
            >
              Reset all
            </button>
          </div>
        </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-2 gap-4">
        <StatCard title="Total Reviews (page)" value={rows.length} />
        <StatCard title="Approved (page)" value={totalApproved} tone="success" />
        <StatCard title="Avg Rating (page)" value={avgAll} />
        <StatCard title="Avg Approved (page)" value={avgApproved} />
      </div>

      <div className="border-t border-gray-200 my-6" />

      <div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-2 gap-4">
        <StatCard title="Total Reviews (page)" value={rows.length} />
        <StatCard title="Approved (page)" value={totalApproved} tone="success" />
        <StatCard title="Avg Rating (page)" value={avgAll} />
        <StatCard title="Avg Approved (page)" value={avgApproved} />
      </div>

      <div className="border-t border-gray-200 my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Average rating by month">
          {loadingSummary ? <div className="h-full w-full animate-pulse bg-gray-100 rounded" /> : <AverageRatingLineChart data={lineData} />}
        </ChartCard>
        <ChartCard title="Reviews by channel">
          {loadingSummary ? <div className="h-full w-full animate-pulse bg-gray-100 rounded" /> : <ChannelBarChart data={channelData} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Review sources"
          height={220}
          className="col-span-1"
          rightSlot={(
            (filters.channels && filters.channels.length) ? (
              <button
                className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                onClick={() => { setFilters({ ...filters, channels: undefined, channel: 'All' }); setPage(1); }}
                aria-label="Clear channel filters"
              >
                Clear
              </button>
            ) : null
          )}
        >
          {loadingSummary ? (
            <div className="h-full w-full animate-pulse bg-gray-100 rounded" />
          ) : (
            <ReviewSourceDonut
              data={channelData}
              selected={filters.channels}
              onSelect={(ch) => {
                const set = new Set(filters.channels || []);
                if (set.has(ch)) set.delete(ch); else set.add(ch);
                const next = Array.from(set);
                setFilters({ ...filters, channel: 'All', channels: next.length ? (next as Channel[]) : undefined });
                setPage(1);
              }}
            />
          )}
        </ChartCard>
        <div className="col-span-1">
          <IssuesKeywordsPanel
            topIssues={insights.topIssues}
            keywords={insights.keywords}
            topIssueCounts={Object.fromEntries(Object.entries(topIssueTrends).map(([k, arr]) => [k, (arr as number[]).reduce((a, b) => a + b, 0)]))}
            onKeywordClick={(term) => {
              const tokens = (filters.q || '').split(/\s+/).filter(Boolean);
              if (!tokens.includes(term)) tokens.push(term);
              setFilters({ ...filters, q: tokens.join(' ') });
              setPage(1);
            }}
            onIssueClick={(cat) => {
              const list = (filters.categories || '').split(',').map(s=>s.trim()).filter(Boolean);
              if (!list.includes(cat)) list.push(cat);
              setFilters({ ...filters, categories: list.join(','), catMin: filters.catMin ?? 7 });
              setPage(1);
            }}
          />
        </div>
      </div>

      <ChartCard title="Sentiment & Categories" height={320}>
        <div className="h-full">
          {loadingSummary ? (
            <div className="h-full w-full animate-pulse bg-gray-100 rounded" />
          ) : (
            <SentimentTrendChart data={sentimentHistory} />
          )}
        </div>
      </ChartCard>

      <div className="border-t border-gray-200 my-6" />

      <ChartCard title="Rating vs Sentiment">
        {loadingRows ? <div className="h-full w-full animate-pulse bg-gray-100 rounded" /> : (
          <RatingSentimentScatter data={rows.filter(r => r.ratingOverall!=null && typeof r.sentimentScore==='number').map(r => ({ rating: r.ratingOverall as number, sentiment: r.sentimentScore as number }))} />
        )}
      </ChartCard>

      <div className="border-t border-gray-200 my-6" />

      <BulkActionToolbar
        selectedCount={selectedIds.length}
        busy={bulkBusy}
        onApprove={() => {
          if (selectedIds.length===0) return; setBulkBusy(true);
          fetch('/api/reviews/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds, approved: true }) })
            .then(()=>{ toast.success(`Approved ${selectedIds.length} reviews`); setSelectedIds([]); setClearSignal((v)=>v+1); loadReviews(); reloadSummary(); })
            .catch(()=>{ toast.error('Approve failed'); })
            .finally(()=> setBulkBusy(false));
        }}
        onUnapprove={() => {
          if (selectedIds.length===0) return; setBulkBusy(true);
          fetch('/api/reviews/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds, approved: false }) })
            .then(()=>{ toast.success(`Unapproved ${selectedIds.length} reviews`); setSelectedIds([]); setClearSignal((v)=>v+1); loadReviews(); reloadSummary(); })
            .catch(()=>{ toast.error('Unapprove failed'); })
            .finally(()=> setBulkBusy(false));
        }}
        onClearSelection={() => { setSelectedIds([]); setClearSignal((v)=>v+1); }}
        onExportCSV={() => {
          if (rows.length===0) { toast('No rows to export'); return; }
          const csv = exportReviewsToCSV(rows);
          triggerDownload("reviews.csv", csv);
        }}
        onExportPDF={() => exportDashboardToPDF("dashboard-export")}
        onOpenRespond={() => {
          const one = rows[0];
          if (!one) return;
          const message = prompt("Manager response:");
          if (message) fetch("/api/mock/responses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewId: one.id, message }) });
        }}
        onOpenRules={() => {
          fetch("/api/mock/config").then(r=>r.json()).then((rules)=>{
            const rt = prompt("Rating threshold (0-10)", String(rules.ratingThreshold));
            const ch = prompt("Channels comma separated", String((rules.channels||[]).join(",")));
            if (rt && ch!=null) fetch("/api/mock/config", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ ratingThreshold: Number(rt), channels: ch.split(/\s*,\s*/).filter(Boolean) })});
          })
        }}
      />

      <ReviewTable
        rows={rows}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
        onSelectRows={setSelectedIds}
        onRowClick={(r) => { setActiveReview(r); setDrawerOpen(true); }}
        onToggleApprove={(id, next) => {
          setPendingIds((prev)=> Array.from(new Set([...prev, id])));
          fetch('/api/reviews/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id], approved: next }) })
            .then(()=>{ toast.success(next? 'Approved' : 'Unapproved'); loadReviews(); reloadSummary(); })
            .catch(()=>{ toast.error('Update failed'); })
            .finally(()=> setPendingIds((prev)=> prev.filter(x=>x!==id)) )
        }}
        pendingIds={pendingIds}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir || 'desc'}
        onSortChange={(by, dir) => { setFilters({ ...filters, sortBy: by, sortDir: dir }); setPage(1); }}
        activeCategories={(filters.categories || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)}
        onQuickCategorySelect={(cat) => {
          const list = (filters.categories || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
          if (!list.includes(cat.toLowerCase())) list.push(cat.toLowerCase())
          setFilters({ ...filters, categories: list.join(','), catMin: filters.catMin ?? 7 })
        }}
        clearSignal={clearSignal}
      />

      <div>
        <div className="text-lg font-semibold text-gray-800 mb-2">Listings</div>
        <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} data={l} onClick={(id) => { setFilters({ ...filters, listingId: id }); setPage(1); }} />
          ))}
        </div>
      </div>

      {listings.length >= 2 ? (
        <ListingComparisonPanel
          listingA={listings[0]}
          listingB={listings[1]}
          averagesA={insights.categoryAverages as RatingItems}
          averagesB={insights.categoryAverages as RatingItems}
        />
      ) : null}

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        review={activeReview}
        onToggleApprove={(id, next) => {
          fetch('/api/reviews/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id], approved: next }) })
            .then(()=>{ loadReviews(); reloadSummary(); setActiveReview((prev) => prev && prev.id === id ? { ...prev, approved: next } : prev || undefined); })
            .catch(()=>{})
        }}
      />
    </main>
  );
}



