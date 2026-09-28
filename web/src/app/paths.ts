export const paths = {
  login: '/login',
  register: '/register',
  connections: '/connections',
  connectionDetail: '/connections/:connectionId',
} as const

export const buildConnectionDetailPath = (connectionId: string) =>
  `/connections/${encodeURIComponent(connectionId)}`