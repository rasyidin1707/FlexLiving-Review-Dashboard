export function toCsv(rows: any[]): string {
  if (!rows.length) return ''
  const headers = [
    'id',
    'listingName',
    'channel',
    'type',
    'status',
    'ratingOverall',
    'publicText',
    'authorName',
    'submittedAt',
    'approved',
  ]
  const esc = (v: any) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""')
    return /[",\r\n]/.test(s) ? `"${s}"` : s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.listingName,
        r.channel,
        r.type,
        r.status,
        r.ratingOverall,
        r.publicText,
        r.authorName,
        r.submittedAt,
        r.approved,
      ]
        .map(esc)
        .join(','),
    )
  }
  return lines.join('\n')
}

export async function downloadCsv(fileName: string, rows: any[]) {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPdfSummary(fileName: string) {
  const [{ default: jsPDF }] = await Promise.all([import('jspdf')])
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const title = 'Flex Living – Reviews Summary'
  doc.setFontSize(16)
  doc.text(title, 40, 40)
  try {
    const { default: html2canvas } = await import('html2canvas')
    const nodes = ['trend-chart', 'channel-chart']
    let y = 70
    for (const id of nodes) {
      const el = document.getElementById(id)
      if (!el) continue
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: '#ffffff', scale: 2 })
      const img = canvas.toDataURL('image/png')
      const w = 500
      const h = (canvas.height / canvas.width) * w
      doc.addImage(img, 'PNG', 40, y, w, h)
      y += h + 20
    }
  } catch {}
  doc.save(fileName)
}

// Build a PDF summary for the full filtered set using the summary API plus
// screenshots of on-screen charts (which already reflect the global set).
export async function downloadPdfSummaryForFilters(fileName: string, params: URLSearchParams) {
  const sp = new URLSearchParams(params.toString())
  // summary ignores pagination already, but ensure we strip these
  sp.delete('page')
  sp.delete('perPage')

  const summary = await fetch(`/api/reviews/summary?${sp.toString()}`).then((r) => r.json())

  const [{ default: jsPDF }] = await Promise.all([import('jspdf')])
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFontSize(16)
  doc.text('Flex Living – Reviews Summary', 40, 40)

  doc.setFontSize(11)
  const totals = `Total: ${summary?.totals?.total ?? 0}  |  Approved: ${summary?.totals?.approved ?? 0}`
  const avgs = `Avg (all): ${summary?.averages?.all ?? '—'}  |  Avg (approved): ${summary?.averages?.approved ?? '—'}`
  doc.text(totals, 40, 62)
  doc.text(avgs, 40, 78)

  // Try to capture charts already visible in the DOM for trend + channels
  try {
    const { default: html2canvas } = await import('html2canvas')
    const nodes = ['trend-chart', 'channel-chart']
    let y = 100
    for (const id of nodes) {
      const el = document.getElementById(id)
      if (!el) continue
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: '#ffffff', scale: 2 })
      const img = canvas.toDataURL('image/png')
      const w = 500
      const h = (canvas.height / canvas.width) * w
      doc.addImage(img, 'PNG', 40, y, w, h)
      y += h + 16
    }
    // Insights (top issues + sentiment)
    const issues: string[] = summary?.insights?.topIssues ?? []
    const sentiment = summary?.insights?.sentimentStats ?? { positive: 0, neutral: 0, negative: 0 }
    doc.text('Insights', 40, ((doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 16 : y))
    const iy = y + 14
    doc.text(`Top issues: ${issues.join(', ') || 'None'}`, 40, iy)
    doc.text(
      `Sentiment: +${sentiment.positive}% / ~${sentiment.neutral}% / -${sentiment.negative}%`,
      40,
      iy + 16,
    )
  } catch {
    // If screenshot fails, still produce a useful PDF using only text
  }

  doc.save(fileName)
}
