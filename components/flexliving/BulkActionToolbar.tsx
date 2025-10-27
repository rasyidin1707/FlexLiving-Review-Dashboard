"use client"

import * as React from "react";
import { Download, Settings2, MessageSquareMore } from "lucide-react";

export default function BulkActionToolbar({
  selectedCount,
  onApprove,
  onUnapprove,
  onExportCSV,
  onExportPDF,
  onOpenRespond,
  onOpenRules,
  busy = false,
  onClearSelection,
}: {
  selectedCount: number;
  onApprove: () => void;
  onUnapprove: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onOpenRespond: () => void;
  onOpenRules: () => void;
  busy?: boolean;
  onClearSelection?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
      <div className="text-sm text-gray-700 dark:text-gray-100">Selected: <span className="font-medium">{selectedCount}</span></div>
      <div className="flex items-center flex-wrap gap-2">
        <button className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed" onClick={onApprove} aria-label="Approve selected" disabled={busy || selectedCount===0}>Approve{selectedCount>0?` (${selectedCount})`:''}</button>
        <button className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed" onClick={onUnapprove} aria-label="Unapprove selected" disabled={busy || selectedCount===0}>Unapprove{selectedCount>0?` (${selectedCount})`:''}</button>
        <button className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed" onClick={onClearSelection || (()=>{})} aria-label="Clear selection" disabled={selectedCount===0}>Clear</button>
        <button className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" onClick={onOpenRespond} aria-label="Respond">
          <MessageSquareMore className="w-4 h-4 mr-1" /> Respond
        </button>
        <button className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" onClick={onOpenRules} aria-label="Auto-approval rules">
          <Settings2 className="w-4 h-4 mr-1" /> Rules
        </button>
        <div className="flex items-center gap-2 ml-2">
          <button className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" onClick={onExportCSV} aria-label="Export CSV">
            <Download className="w-4 h-4 mr-1" /> CSV
          </button>
          <button className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all" onClick={onExportPDF} aria-label="Export PDF">
            <Download className="w-4 h-4 mr-1" /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}
