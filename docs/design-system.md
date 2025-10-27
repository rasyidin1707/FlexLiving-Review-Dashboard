# FlexLiving Dashboard – Design System

This document captures the visual language implemented in the app.

## Brand & Theme

- Primary: Indigo `#6366F1`
- Secondary: Cyan `#06B6D4`
- Background: Gray-50 `#F9FAFB`
- Card: White `#FFFFFF`
- Borders: Gray-200 `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Success: `#10B981` · Warning: `#F59E0B` · Danger: `#EF4444`

Tailwind extension: `brand.primary`, `brand.secondary`.

## Layout

- Container: `max-w-7xl mx-auto px-6 lg:px-8`
- Grids: filters (3 cols), stats (4 cols), charts (2 cols), listings (1/2/3 responsive)

## Components

- Cards: `rounded-xl border border-gray-200 bg-white p-5 shadow-sm`
- Primary button: `bg-brand-primary text-white rounded-lg hover:shadow-md hover:scale-[1.01]`
- Inputs: `rounded-lg border-gray-200 bg-white focus-visible:ring-brand-primary`
- Table:
  - header: `bg-gray-50 text-gray-700`
  - rows: `hover:bg-gray-50 transition-colors`
- Chips: rating colored by thresholds (≥8 green, 5–7 yellow, else red)

## Charts

- Line: indigo `#6366F1`; tooltip white with soft shadow
- Bars: cyan `#06B6D4`
- Radar: stroke indigo, fill rgba(99,102,241,0.4)

## Motion

- Subtle transitions on overlays only:
  - Export menu: fade + 95%→100% scale (Headless UI Popover + Transition)
  - Review drawer: fade overlay, slide-in panel (Headless UI Dialog + Transition)
  - Respect reduced motion via `motion-reduce:transition-none`

