import type { ReactNode } from 'react'

interface GradientBannerProps {
  eyebrow?: string
  title: string
  description: ReactNode
  action?: ReactNode
  decorativeIcon?: ReactNode
}

export function GradientBanner({
  eyebrow,
  title,
  description,
  action,
  decorativeIcon,
}: GradientBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-lg shadow-primary/20 sm:p-10">
      <span aria-hidden className="absolute -top-20 -right-16 size-64 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-white/5" />
      {decorativeIcon && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 -bottom-8 -rotate-12 text-white/15 [&_svg]:text-[160px]"
        >
          {decorativeIcon}
        </span>
      )}

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          {eyebrow && <p className="text-sm font-semibold text-white/75">{eyebrow}</p>}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <div className="text-white/85">{description}</div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  )
}