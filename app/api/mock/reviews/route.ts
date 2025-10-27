import { NextRequest, NextResponse } from "next/server";
import { mockReviews } from "@/data/mock/seed";
import type { Channel } from "@/components/flexliving/types";

function toDate(s?: string | null) {
  return s ? new Date(s) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const listingId = searchParams.get("listingId") || undefined;
  const channel = (searchParams.get("channel") || undefined) as Channel | undefined;
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const approvedParam = searchParams.get("approved") || "All"; // All | Approved | NotApproved
  const ratingMin = Number(searchParams.get("ratingMin") ?? 0);
  const ratingMax = Number(searchParams.get("ratingMax") ?? 10);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 10)));

  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;

  let rows = mockReviews.slice();

  // Text search over authorName, publicText, listingName
  if (q) {
    rows = rows.filter((r) =>
      (r.authorName || "").toLowerCase().includes(q) ||
      (r.publicText || "").toLowerCase().includes(q) ||
      (r.listingName || "").toLowerCase().includes(q),
    );
  }

  if (listingId) rows = rows.filter((r) => r.listingId === listingId);
  if (channel && channel !== ("All" as unknown as Channel)) rows = rows.filter((r) => r.channel === channel);
  if (type && type !== "All") rows = rows.filter((r) => (r.type || "") === type);
  if (status && status !== "All") rows = rows.filter((r) => (r.status || "") === status);

  if (approvedParam === "Approved") rows = rows.filter((r) => r.approved === true);
  if (approvedParam === "NotApproved") rows = rows.filter((r) => r.approved === false);

  rows = rows.filter((r) => {
    const ro = r.ratingOverall ?? null;
    const inRange = ro == null ? false : ro >= ratingMin && ro <= ratingMax;
    if (!inRange) return false;
    const d = toDate(r.submittedAt);
    if (from && (!d || d < from)) return false;
    if (to && (!d || d > to)) return false;
    return true;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = rows.slice(start, end);

  return NextResponse.json({ rows: paged, total });
}

