import type { ReactNode } from 'react'

function renderInline(text: string) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return segments.map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }
    return <span key={index}>{segment}</span>
  })
}

function normalize(raw: string) {
  return raw
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/<font[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/font>/gi, '\n\n### $1\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/_x005f/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\|\s+\|/g, '|\n|')
    .trim()
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line)
}

function isTable(lines: string[]) {
  return lines.length >= 2 && lines[0].includes('|') && isTableDivider(lines[1])
}

function parseTableRow(line: string) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderTable(lines: string[], key: number) {
  const headers = parseTableRow(lines[0])
  const rows = lines.slice(2).map(parseTableRow)

  return (
    <div key={key} className="overflow-x-auto rounded-lg border border-border-secondary">
      <table className="min-w-[720px] border-collapse bg-bg-container text-left text-sm">
        <thead className="bg-fill-quaternary text-text">
          <tr>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} className="border-b border-border-secondary px-12 py-10 font-medium">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-secondary">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top">
              {headers.map((header, cellIndex) => (
                <td key={`${header}-${cellIndex}`} className="min-w-[120px] max-w-[280px] px-12 py-10 leading-relaxed text-text-secondary">
                  {renderInline(row[cellIndex] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function isHeading(line: string) {
  return /^#{1,6}\s+/.test(line)
}

function headingText(line: string) {
  return line.replace(/^#{1,6}\s+/, '')
}

function isHorizontalRule(line: string) {
  return /^-{3,}$/.test(line)
}

function isListItem(line: string) {
  return /^[-*]\s+/.test(line)
}

function startsTable(lines: string[], index: number) {
  return Boolean(lines[index]?.includes('|') && lines[index + 1] && isTableDivider(lines[index + 1]))
}

export default function RichText({ content }: { content: string }) {
  const lines = normalize(content)
    .replace(/^- - -$/gm, '---')
    .split('\n')
    .map((line) => line.trim())

  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line) {
      index += 1
      continue
    }

    if (isHeading(line)) {
      nodes.push(
        <h3 key={`heading-${index}`} className="m-0 text-base font-medium text-text">
          {renderInline(headingText(line))}
        </h3>
      )
      index += 1
      continue
    }

    if (isHorizontalRule(line)) {
      nodes.push(<hr key={`hr-${index}`} className="my-8 border-0 border-t border-border-secondary" />)
      index += 1
      continue
    }

    if (startsTable(lines, index)) {
      const tableLines: string[] = []
      while (lines[index]?.includes('|')) {
        tableLines.push(lines[index])
        index += 1
      }
      if (isTable(tableLines)) {
        nodes.push(renderTable(tableLines, index))
      }
      continue
    }

    if (isListItem(line)) {
      const items: string[] = []
      while (isListItem(lines[index] ?? '')) {
        items.push(lines[index].replace(/^[-*]\s+/, ''))
        index += 1
      }
      nodes.push(
        <ul key={`list-${index}`} className="m-0 space-y-6 pl-20 text-base leading-relaxed text-text">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    const paragraphLines: string[] = []
    while (
      lines[index] &&
      !isHeading(lines[index]) &&
      !isHorizontalRule(lines[index]) &&
      !startsTable(lines, index) &&
      !isListItem(lines[index])
    ) {
      paragraphLines.push(lines[index])
      index += 1
    }

    nodes.push(
      <p key={`paragraph-${index}`} className="m-0 text-base leading-relaxed text-text">
        {renderInline(paragraphLines.join('\n'))}
      </p>
    )
  }

  return <div className="space-y-16 whitespace-pre-line">{nodes}</div>
}
