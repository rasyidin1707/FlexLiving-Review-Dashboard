import type { ReviewRow } from "@/components/flexliving/types";

export function exportReviewsToCSV(rows: ReviewRow[]): string {
  const headers = [
    "id",
    "listingId",
    "listingName",
    "channel",
    "type",
    "status",
    "ratingOverall",
    "authorName",
    "submittedAt",
    "approved",
    "sentimentScore",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const vals = [
      r.id,
      r.listingId,
      r.listingName,
      r.channel,
      r.type ?? "",
      r.status ?? "",
      r.ratingOverall == null ? "" : String(r.ratingOverall),
      r.authorName ?? "",
      r.submittedAt ?? "",
      r.approved ? "true" : "false",
      typeof r.sentimentScore === "number" ? String(r.sentimentScore) : "",
    ];
    lines.push(vals.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

function csvEscape(v: string) {
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

export function triggerDownload(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

