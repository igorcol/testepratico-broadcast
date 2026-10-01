
// Formatação de texto para a mensagem

export type FormatStyle = 'bold' | 'italic' | 'strike' | 'mono'

export type FormattedNode =
  | { type: 'text'; text: string }
  | { type: FormatStyle; children: FormattedNode[] }

export const FORMAT_MARKERS: Record<FormatStyle, string> = {
  bold: '*',
  italic: '_',
  strike: '~',
  mono: '```',
}

const FORMAT_PATTERN =
  /```([\s\S]+?)```|(?<![\p{L}\p{N}])\*(\S(?:[^*\n]*?\S)?)\*(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])_(\S(?:[^_\n]*?\S)?)_(?![\p{L}\p{N}])|(?<![\p{L}\p{N}])~(\S(?:[^~\n]*?\S)?)~(?![\p{L}\p{N}])/gu

const toFormattedNode = (match: RegExpMatchArray): FormattedNode => {
  const [, mono, bold, italic, strike] = match

  if (mono !== undefined) return { type: 'mono', children: [{ type: 'text', text: mono }] }
  if (bold !== undefined) return { type: 'bold', children: parseFormatting(bold) }
  if (italic !== undefined) return { type: 'italic', children: parseFormatting(italic) }
  return { type: 'strike', children: parseFormatting(strike ?? '') }
}

export const parseFormatting = (text: string): FormattedNode[] => {
  const { nodes, lastIndex } = [...text.matchAll(FORMAT_PATTERN)].reduce<{
    nodes: FormattedNode[]
    lastIndex: number
  }>(
    (accumulator, match) => {
      const matchStart = match.index ?? 0
      const textBefore = text.slice(accumulator.lastIndex, matchStart)

      return {
        nodes: [
          ...accumulator.nodes,
          ...(textBefore ? [{ type: 'text' as const, text: textBefore }] : []),
          toFormattedNode(match),
        ],
        lastIndex: matchStart + match[0].length,
      }
    },
    { nodes: [], lastIndex: 0 },
  )

  const textAfter = text.slice(lastIndex)
  return textAfter ? [...nodes, { type: 'text', text: textAfter }] : nodes
}

interface TextSelection {
  value: string
  selectionStart: number
  selectionEnd: number
}

export const toggleFormat = (
  value: string,
  rawStart: number,
  rawEnd: number,
  marker: string,
): TextSelection => {
  const rawSelection = value.slice(rawStart, rawEnd)
  const hasText = rawSelection.trim().length > 0
  const selectionStart = hasText ? rawStart + (rawSelection.length - rawSelection.trimStart().length) : rawStart
  const selectionEnd = hasText ? rawEnd - (rawSelection.length - rawSelection.trimEnd().length) : rawEnd

  const before = value.slice(0, selectionStart)
  const selected = value.slice(selectionStart, selectionEnd)
  const after = value.slice(selectionEnd)

  if (before.endsWith(marker) && after.startsWith(marker)) {
    return {
      value: before.slice(0, -marker.length) + selected + after.slice(marker.length),
      selectionStart: selectionStart - marker.length,
      selectionEnd: selectionEnd - marker.length,
    }
  }

  return {
    value: before + marker + selected + marker + after,
    selectionStart: selectionStart + marker.length,
    selectionEnd: selectionEnd + marker.length,
  }
}