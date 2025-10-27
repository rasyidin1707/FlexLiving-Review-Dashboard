"use client"

import * as React from "react";
import { type ReactNode } from "react";
import { motion } from "framer-motion";

type Tone = "default" | "success" | "warning" | "error";

export default function StatCard({
  title,
  value,
  icon,
  tone = "default",
  hint,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const toneClasses =
    tone === "success"
      ? "text-green-600"
      : tone === "warning"
      ? "text-yellow-600"
      : tone === "error"
      ? "text-red-600"
      : "text-gray-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-all duration-150 ease-out hover:shadow-md hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</div>
        {icon ? <div className="text-gray-400">{icon}</div> : null}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${tone === 'default' ? 'text-gray-900 dark:text-gray-100' : toneClasses}`}>{value}</div>
      {hint ? <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</div> : null}
    </motion.div>
  );
}
