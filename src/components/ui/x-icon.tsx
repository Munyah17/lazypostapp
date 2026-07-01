import { cn } from '@/lib/utils'

interface XIconProps {
  className?: string
}

export function XIcon({ className }: XIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('fill-current', className)}
      aria-label="X (Twitter)"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
