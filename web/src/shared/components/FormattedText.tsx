import { Fragment, type ReactNode } from 'react'
import { parseFormatting, type FormattedNode } from '@/shared/lib/whatsappFormat'

const renderNodes = (nodes: FormattedNode[]): ReactNode[] =>
  nodes.map((node, index) => {
    if (node.type === 'text') return <Fragment key={index}>{node.text}</Fragment>

    const children = renderNodes(node.children)

    switch (node.type) {
      case 'bold':
        return <strong key={index} className="font-bold">{children}</strong>
      case 'italic':
        return <em key={index}>{children}</em>
      case 'strike':
        return <s key={index}>{children}</s>
      case 'mono':
        return (
          <code key={index} className="rounded bg-slate-900/5 px-1 font-mono text-[0.9em]">
            {children}
          </code>
        )
    }
  })

interface FormattedTextProps {
  text: string
}

// Desenha a formatação do WhatsApp com elementos React
export function FormattedText({ text }: FormattedTextProps) {
  return <>{renderNodes(parseFormatting(text))}</>
}