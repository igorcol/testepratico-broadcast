import { Paper, Skeleton } from '@mui/material'

interface ListSkeletonProps {
  rows?: number
}

export function ListSkeleton({ rows = 3 }: ListSkeletonProps) {
  return (
    <Paper variant="outlined" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex flex-col gap-1 border-b border-divider px-4 py-3 last:border-b-0">
          <Skeleton width="40%" />
          <Skeleton width="25%" />
        </div>
      ))}
    </Paper>
  )
}