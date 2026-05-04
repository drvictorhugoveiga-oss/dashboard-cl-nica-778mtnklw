/* Skeleton Component - A component that displays a skeleton (a component that displays a loading state) - from shadcn/ui (exposes Skeleton) */
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted/60 relative overflow-hidden before:absolute before:inset-0 before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
