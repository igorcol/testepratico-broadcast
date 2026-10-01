
interface BrandLogoProps {
  size?: 'md' | 'lg'
}

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`font-extrabold tracking-tight text-slate-900 ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}
      >
        Broadcast
      </span>
    </span>
  )
}