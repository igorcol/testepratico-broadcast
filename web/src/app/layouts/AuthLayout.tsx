import type { ReactNode } from 'react'
import { Paper } from '@mui/material'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import { Outlet } from 'react-router'
import { BrandLogo } from '@/shared/components/BrandLogo'
import { IconTile } from '@/shared/components/IconTile'

interface Highlight {
  icon: ReactNode
  title: string
  description: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: <BoltRoundedIcon />,
    title: 'Envio imediato',
    description: 'Selecione os contatos e dispare na hora.',
  },
  {
    icon: <ScheduleRoundedIcon />,
    title: 'Agendamento automático',
    description: 'Programe a data e o horário, o envio acontece sozinho.',
  },
]

export function AuthLayout() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <section className="flex flex-col items-center justify-center gap-8 p-6">
        <div className="lg:hidden">
          <BrandLogo size="lg" />
        </div>
        <Paper variant="outlined" className="w-full max-w-md p-8 sm:p-10">
          <Outlet />
        </Paper>
      </section>
    </main>
  )
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <span aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-32 -left-20 size-80 rounded-full bg-white/5" />
      <CampaignRoundedIcon
        aria-hidden
        className="absolute right-8 bottom-8 -rotate-12 text-[240px] text-white/10"
      />

      <div className="relative">
        <BrandLogo size="lg" tone="light" />
      </div>

      <div className="relative flex max-w-md flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="text-4xl leading-tight font-extrabold tracking-tight">
            Envio de mensagens em massa.
          </p>
          <p className="text-lg text-white/80">
            Organize contatos por conexão e envie ou agende mensagens em poucos cliques.
          </p>
        </div>

        <ul className="flex flex-col gap-5">
          {HIGHLIGHTS.map(({ icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <IconTile icon={icon} variant="glass" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-white/75">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/60">Broadcast · Teste prático</p>
    </aside>
  )
}