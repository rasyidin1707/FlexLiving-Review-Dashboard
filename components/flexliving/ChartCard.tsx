"use client"

import * as React from "react";
import { motion } from "framer-motion";

export default function ChartCard({
  title,
  subtitle,
  rightSlot,
  children,
  height = 256,
  className = "",
}: {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  height?: number; // px
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</div>
          {subtitle ? <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div> : null}
        </div>
        {rightSlot}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </motion.div>
  );
}
