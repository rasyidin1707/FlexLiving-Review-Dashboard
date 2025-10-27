"use client"

import { useEffect, useRef, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'

type Props = {
  onCsv: () => void
  onPdfClient: () => void
  onPdfServer: () => void
}

export function ExportMenu({ onCsv, onPdfClient, onPdfServer }: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onScroll = () => setOpen(false)
    const onResize = () => setOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize) }
  }, [open])

  const wrap = (fn: () => void, close: () => void) => () => { try { fn() } finally { close() } }

  return (
    <Popover className="relative" as="div">
      {({ open: isOpen, close }) => {
        if (open !== isOpen) setOpen(isOpen)
        return (
          <>
            <Popover.Button className="btn btn-secondary">Export ▾</Popover.Button>
            <Transition
              show={isOpen}
              enter="transition ease-out duration-150 motion-reduce:transition-none"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100 motion-reduce:transition-none"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel ref={panelRef} className="absolute right-0 z-20 mt-2 min-w-[200px] rounded-md border bg-card p-1 shadow-lg">
                <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted" onClick={wrap(onCsv, close)}>
                  CSV (all filtered)
                </button>
                <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted" onClick={wrap(onPdfClient, close)}>
                  PDF with charts (client)
                </button>
                <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted" onClick={wrap(onPdfServer, close)}>
                  PDF summary (server)
                </button>
              </Popover.Panel>
            </Transition>
          </>
        )
      }}
    </Popover>
  )
}
