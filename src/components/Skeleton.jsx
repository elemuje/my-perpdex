import { cn } from '@/lib/utils'
export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-white/5', className)} {...props} />
}
export function SkeletonRow({ cols = 4, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
  )
}
export function SkeletonCard({ rows = 3, className }) {
  return (
    <div className={cn('glass-card rounded-xl p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  )
}
