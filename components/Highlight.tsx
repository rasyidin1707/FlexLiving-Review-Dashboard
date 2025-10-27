type Props = {
  text: string | null | undefined
  tokens: string[]
}

export function Highlight({ text, tokens }: Props) {
  const value = text ?? ''
  if (!value || tokens.length === 0) return <>{value}</>

  // Build a case-insensitive regex that matches any token
  const escaped = tokens.map(escapeRegExp).filter(Boolean)
  if (escaped.length === 0) return <>{value}</>
  const re = new RegExp(`(${escaped.join('|')})`, 'ig')

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(value)) !== null) {
    const [match] = m
    const start = m.index
    const end = start + match.length
    if (start > lastIndex) parts.push(value.slice(lastIndex, start))
    parts.push(
      <mark key={`${start}-${end}`} className="rounded bg-yellow-200 px-0.5 text-inherit">
        {value.slice(start, end)}
      </mark>,
    )
    lastIndex = end
  }
  if (lastIndex < value.length) parts.push(value.slice(lastIndex))

  return <>{parts}</>
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

