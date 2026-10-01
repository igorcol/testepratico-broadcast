import type { ReactNode } from 'react'

interface ScrollRegionProps {
  label: string
  children: ReactNode
}

export function ScrollRegion({ label, children }: ScrollRegionProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary lg:-m-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-2 lg:scrollbar-thin"
    >
      {children}
    </div>
  )
}