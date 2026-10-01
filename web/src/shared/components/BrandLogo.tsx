
interface BrandLogoProps {
  size?: 'md' | 'lg'
  tone?: 'dark' | 'light'
}

export function BrandLogo({ size = 'md', tone = 'dark' }: BrandLogoProps) {
  const isLight = tone === 'light'

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`font-extrabold tracking-tight ${isLight ? 'text-white' : 'text-slate-900'} ${
          size === 'lg' ? 'text-2xl' : 'text-xl'
        }`}
      >
        Broadcast
      </span>
    </span>
  )
}