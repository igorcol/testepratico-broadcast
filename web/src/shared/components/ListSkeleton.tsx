import { Paper, Skeleton } from '@mui/material'

interface ListSkeletonProps {
  rows?: number
}

export function ListSkeleton({ rows = 3 }: ListSkeletonProps) {
  return (
    <Paper variant="outlined" aria-busy="true" aria-label="Carregando" className="overflow-hidden">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-divider px-4 py-3 last:border-b-0"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton width="35%" />
            <Skeleton width="20%" />
          </div>
        </div>
      ))}
    </Paper>
  )
}