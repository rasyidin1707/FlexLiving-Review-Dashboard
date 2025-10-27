"use client"

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Mode = "light" | "dark" | "system";

function applyMode(mode: Mode) {
  const root = document.documentElement;
  let dark = false;
  if (mode === "dark") dark = true;
  else if (mode === "light") dark = false;
  else if (mode === "system") dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", dark);
  root.setAttribute("data-theme-ready", "true");
}

export default function ThemeToggle() {
  const [mode, setMode] = React.useState<Mode>("system");
  const [open, setOpen] = React.useState(false);
  const [systemDark, setSystemDark] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") as Mode | null) || "system";
      setMode(saved);
      if (window.matchMedia) {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemDark(!!mql.matches);
        const listener = () => {
          setSystemDark(!!mql.matches);
          if ((localStorage.getItem('theme') || 'system') === 'system') applyMode('system');
        };
        mql.addEventListener?.("change", listener);
        applyMode(saved);
        return () => mql.removeEventListener?.("change", listener);
      } else {
        applyMode(saved);
      }
    } catch {}
  }, []);

  const update = (next: Mode) => {
    setMode(next);
    try { localStorage.setItem("theme", next); } catch {}
    applyMode(next);
    setOpen(false);
  };

  const effective: Mode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  return (
    <div className="relative">
      {/* Icon-only button on small screens */}
      <button
        className="md:hidden inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme options — current ${mode === 'system' ? `system (${effective})` : mode}`}
      >
        {effective === 'dark' ? <Moon className="w-4 h-4" /> : effective === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
      </button>
      {open ? (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-1 z-50"
          role="menu"
        >
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" onClick={() => update('light')} role="menuitem">
            <span className="inline-flex items-center gap-2"><Sun className="w-4 h-4" /> Light</span>
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" onClick={() => update('dark')} role="menuitem">
            <span className="inline-flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</span>
          </button>
          <button className="w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" onClick={() => update('system')} role="menuitem">
            <span className="inline-flex items-center gap-2"><Monitor className="w-4 h-4" /> System</span>
          </button>
        </div>
      ) : null}

      {/* Segmented control on md+ */}
      <div className="hidden md:inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${mode === 'light' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-700 dark:text-gray-200'}`}
            onClick={() => update("light")}
            aria-pressed={mode === "light"}
            aria-label="Use light mode"
          >
            <Sun className="w-4 h-4" /> Light
          </button>
          <button
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${mode === 'dark' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-700 dark:text-gray-200'}`}
            onClick={() => update("dark")}
            aria-pressed={mode === "dark"}
            aria-label="Use dark mode"
          >
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${mode === 'system' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-700 dark:text-gray-200'}`}
            onClick={() => update("system")}
            aria-pressed={mode === "system"}
            aria-label="Follow system theme"
          >
            <Monitor className="w-4 h-4" /> System
          </button>
        </div>
        {mode === 'system' ? (
          <span className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200" title={`Following system theme — currently ${effective}`}>System ({effective})</span>
        ) : null}
      </div>
    </div>
  );
}
