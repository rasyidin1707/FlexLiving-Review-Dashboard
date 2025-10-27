"use client"

import * as React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
      <ThemeToggle />
    </div>
  );
}

