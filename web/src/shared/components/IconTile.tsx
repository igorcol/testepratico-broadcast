import type { ReactNode } from 'react'

type IconTileVariant = 'gradient' | 'soft' | 'glass'
type IconTileSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<IconTileVariant, string> = {
  gradient: 'bg-brand-gradient text-white shadow-md shadow-primary/25',
  soft: 'bg-primary/10 text-primary',
  glass: 'bg-white/15 text-white ring-1 ring-white/20 backdrop-blur',
}

const SIZE_CLASSES: Record<IconTileSize, string> = {
  sm: 'size-9 rounded-lg [&_svg]:text-xl',
  md: 'size-11 rounded-xl [&_svg]:text-2xl',
  lg: 'size-14 rounded-2xl [&_svg]:text-3xl',
}

interface IconTileProps {
  icon: ReactNode
  variant?: IconTileVariant
  size?: IconTileSize
}

export function IconTile({ icon, variant = 'soft', size = 'md' }: IconTileProps) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`}
    >
      {icon}
    </span>
  )
}