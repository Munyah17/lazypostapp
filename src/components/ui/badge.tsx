import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-[family-name:var(--font-mono)] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/30',
        secondary: 'bg-[#13181f] text-[#8a9bb0] border border-[#1e2a3a]',
        success: 'bg-green-900/50 text-green-300 border border-green-700/30',
        warning: 'bg-amber-900/50 text-amber-300 border border-amber-700/30',
        destructive: 'bg-red-900/50 text-red-300 border border-red-700/30',
        outline: 'border border-[#1e2a3a] text-[#8a9bb0]',
        free: 'bg-slate-800 text-slate-300',
        starter: 'bg-blue-900/50 text-blue-300',
        pro: 'bg-violet-900/50 text-violet-300',
        agency: 'bg-amber-900/50 text-amber-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
