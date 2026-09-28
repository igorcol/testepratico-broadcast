import { Typography } from '@mui/material'
import { useParams } from 'react-router'

export function ConnectionDetailPage() {
  const { connectionId } = useParams()

  return (
    <Typography variant="h4" component="h1">
      Conexão: {connectionId}
    </Typography>
  )
}