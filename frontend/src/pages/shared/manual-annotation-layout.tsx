import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import type { MouseEvent, ReactNode } from 'react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import Card from '../../components/data-display/card'
import Empty from '../../components/data-display/empty'
import Cascader from '../../components/data-entry/cascader'
import Form from '../../components/data-entry/form'
import Input from '../../components/data-entry/input'
import Button from '../../components/feedback/button'

export type ManualQualityRuleOption = {
  id: string
  category: string
  categoryLabel: string
  title: string
  content: string
  score: string
}

export type ManualLayoutEntry = {
  id: string
  sourceText: string
  startOffset: number
  endOffset: number
  qualityRuleId: string
  qualityRuleTitle: string
  qualityRuleContent: string
  qualityRuleScore: string
  suggestion: string
  notes?: string | null
  createdAt?: string
}

export type ManualLayoutFormValue = {
  sourceText: string
  startOffset: number
  endOffset: number
  qualityRuleId?: string
  suggestion?: string
  notes?: string | null
}

export type ManualLayoutFormState = {
  mode: 'create' | 'edit'
  entryId?: string
  values: ManualLayoutFormValue
}

type SelectionState = ManualLayoutFormValue & {
  buttonLeft: number
  buttonTop: number
}

type ManualAnnotationLayoutProps = {
  recordText: string
  hospitalizationNo: string
  entries: ManualLayoutEntry[]
  rules: ManualQualityRuleOption[]
  readonly?: boolean
  formState?: ManualLayoutFormState | null
  forceValidationPreview?: boolean
  recordHeaderAction?: ReactNode
  rightTitle?: ReactNode
  onSelectText?: (value: ManualLayoutFormValue) => void
  onEdit?: (entry: ManualLayoutEntry) => void
  onDelete?: (entry: ManualLayoutEntry) => void
  onCancelForm?: () => void
  onSaveForm?: (values: ManualLayoutFormValue) => void
}

type EntryFormValue = ManualLayoutFormValue & {
  qualityRulePath?: string[]
}

type ManualRuleCascaderOption = {
  value: string
  label: ReactNode
  text: string
  searchText?: string
  children?: ManualRuleCascaderOption[]
}

type NormalizedRecordText = {
  text: string
  displayToRaw: number[]
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const iconButtonBaseClass =
  '!h-[24px] !min-w-[24px] !w-[24px] rounded-md border border-transparent !p-0 !leading-none shadow-none transition-colors [&_.anticon]:!text-current [&_.anticon]:text-[14px]'
const editIconButtonClass = cx(
  iconButtonBaseClass,
  '!bg-transparent !text-[var(--color-text-secondary)] hover:!border-[var(--color-primary-border)] hover:!bg-[var(--color-primary-bg)] hover:!text-[var(--color-primary)] active:!border-[var(--color-primary-active)] active:!bg-[var(--color-primary-bg-hover)] active:!text-[var(--color-primary-active)]'
)
const deleteIconButtonClass = cx(
  iconButtonBaseClass,
  '!bg-transparent !text-[var(--color-error)] hover:!border-[var(--color-error)] hover:!bg-[var(--color-error)] hover:!text-[var(--color-bg-container)] active:!border-[var(--color-error-active)] active:!bg-[var(--color-error-active)] active:!text-[var(--color-bg-container)]'
)

function lineTop(recordText: string, offset: number) {
  const before = recordText.slice(0, Math.max(0, offset))
  const lineCount = before.split('\n').length - 1
  return 24 + lineCount * 32
}

function normalizeRecordTextWithMap(raw: string): NormalizedRecordText {
  const chars: string[] = []
  const displayToRaw: number[] = []

  function append(value: string, rawIndex: number) {
    chars.push(value)
    displayToRaw.push(rawIndex)
  }

  let index = 0
  while (index < raw.length) {
    const rest = raw.slice(index)
    if (rest.startsWith('\\r\\n')) {
      append('\n', index)
      index += 4
      continue
    }
    if (rest.startsWith('\\n') || rest.startsWith('\\r')) {
      append('\n', index)
      index += 2
      continue
    }
    if (rest.startsWith('_x005f')) {
      index += 6
      continue
    }
    const char = raw[index]
    if (char === '\r') {
      append('\n', index)
      index += raw[index + 1] === '\n' ? 2 : 1
      continue
    }
    if (char === '<') {
      const br = rest.match(/^<br\s*\/?>/i)
      if (br) {
        append('\n', index)
        index += br[0].length
        continue
      }
      const paragraphClose = rest.match(/^<\/p>/i)
      if (paragraphClose) {
        append('\n', index)
        index += paragraphClose[0].length
        continue
      }
      const tag = rest.match(/^<[^>]+>/)
      if (tag) {
        index += tag[0].length
        continue
      }
    }
    append(char, index)
    index += 1
  }

  return { text: chars.join(''), displayToRaw }
}

function displayOffsetForRawOffset(normalized: NormalizedRecordText, rawOffset: number) {
  const index = normalized.displayToRaw.findIndex((mappedRawOffset) => mappedRawOffset >= rawOffset)
  return index === -1 ? normalized.text.length : index
}

function displayEndOffsetForRawEnd(normalized: NormalizedRecordText, rawEndOffset: number) {
  const index = normalized.displayToRaw.findIndex((mappedRawOffset) => mappedRawOffset >= rawEndOffset)
  return index === -1 ? normalized.text.length : index
}

function rawOffsetForDisplayOffset(normalized: NormalizedRecordText, displayOffset: number, fallback: number) {
  return normalized.displayToRaw[Math.min(displayOffset, normalized.displayToRaw.length - 1)] ?? fallback
}

function rawEndOffsetForDisplayEnd(normalized: NormalizedRecordText, displayEndOffset: number, fallback: number) {
  const rawOffset = normalized.displayToRaw[Math.max(0, displayEndOffset - 1)]
  return rawOffset === undefined ? fallback : rawOffset + 1
}

function measuredTopFor(displayText: string, normalized: NormalizedRecordText, rawOffset: number, measuredTops: Map<number, number>) {
  return measuredTops.get(rawOffset) ?? lineTop(displayText, displayOffsetForRawOffset(normalized, rawOffset))
}

function itemHeightFor(itemId: string, measuredItemHeights: Map<string, number>, fallback: number) {
  return measuredItemHeights.get(itemId) ?? fallback
}

function mapsEqual(left: Map<string, number>, right: Map<string, number>) {
  if (left.size !== right.size) return false
  for (const [key, value] of left) {
    if (right.get(key) !== value) return false
  }
  return true
}

function layoutItems(
  displayText: string,
  normalizedRecord: NormalizedRecordText,
  entries: ManualLayoutEntry[],
  formState: ManualLayoutFormState | null | undefined,
  measuredTops: Map<number, number>,
  measuredItemHeights: Map<string, number>
) {
  const visibleEntries = formState?.mode === 'edit' && formState.entryId ? entries.filter((entry) => entry.id !== formState.entryId) : entries
  const items = [
    ...visibleEntries.map((entry) => ({
      type: 'entry' as const,
      id: entry.id,
      entry,
      startOffset: entry.startOffset,
      height: itemHeightFor(`entry:${entry.id}`, measuredItemHeights, 128)
    })),
    ...(formState
      ? [
          {
            type: 'form' as const,
            id: 'form',
            formState,
            startOffset: formState.values.startOffset,
            height: itemHeightFor('form', measuredItemHeights, 456)
          }
        ]
      : [])
  ].sort((a, b) => a.startOffset - b.startOffset)

  let cursor = 0
  const entryTops = new Map<string, number>()
  let formTop: number | null = null
  items.forEach((item) => {
    const preferred = measuredTopFor(displayText, normalizedRecord, item.startOffset, measuredTops)
    const top = Math.max(preferred, cursor)
    cursor = top + item.height + 12
    if (item.type === 'entry') entryTops.set(item.id, top)
    if (item.type === 'form') formTop = top
  })
  return { visibleEntries, entryTops, formTop, minHeight: Math.max(720, cursor + 32) }
}

function renderHighlightedText(
  displayText: string,
  ranges: Array<{ id: string; startOffset: number; endOffset: number; temporary?: boolean }>,
  selectedEntryId?: string | null
) {
  const nodes: ReactNode[] = []
  let cursor = 0
  ranges.forEach((entry) => {
    if (entry.startOffset > cursor) {
      nodes.push(displayText.slice(cursor, entry.startOffset))
    }
    nodes.push(
      <mark
        key={entry.id}
        className={cx(
          'rounded-sm px-2 text-[var(--color-text)]',
          !entry.temporary && selectedEntryId === entry.id
            ? 'bg-[var(--color-error-bg-active)] outline outline-1 outline-[var(--color-error-border-hover)]'
            : 'bg-[var(--color-yellow-2)]'
        )}
      >
        {displayText.slice(entry.startOffset, entry.endOffset)}
      </mark>
    )
    cursor = entry.endOffset
  })
  if (cursor < displayText.length) {
    nodes.push(displayText.slice(cursor))
  }
  return nodes
}

function EntryCard({
  entry,
  selected,
  readonly,
  onSelect,
  onEdit,
  onDelete
}: {
  entry: ManualLayoutEntry
  selected?: boolean
  readonly?: boolean
  onSelect?: (entry: ManualLayoutEntry) => void
  onEdit?: (entry: ManualLayoutEntry) => void
  onDelete?: (entry: ManualLayoutEntry) => void
}) {
  return (
    <Card
      size="small"
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation()
        onSelect?.(entry)
      }}
      className={cx(
        'mx-16 cursor-pointer border-[var(--color-border-secondary)] transition-colors hover:border-[var(--color-primary-border)] hover:shadow-[var(--shadow-control-primary)] [&_.ant-card-body]:p-12',
        selected && 'border-[var(--color-primary-active)] bg-[var(--color-primary-bg)] shadow-[var(--shadow-control-primary)] hover:border-[var(--color-primary-active)]'
      )}
    >
      <div className={cx('relative', !readonly && 'pr-64')}>
        {!readonly ? (
          <div className="absolute right-0 top-0 flex items-center gap-4">
            <Button
              size="small"
              variant="text"
              content="iconOnly"
              icon={<EditOutlined />}
              className={editIconButtonClass}
              onClick={(event) => {
                event.stopPropagation()
                onEdit?.(entry)
              }}
              aria-label="编辑"
            />
            <Button
              size="small"
              color="danger"
              variant="text"
              content="iconOnly"
              icon={<DeleteOutlined />}
              className={deleteIconButtonClass}
              onClick={(event) => {
                event.stopPropagation()
                onDelete?.(entry)
              }}
              aria-label="删除"
            />
          </div>
        ) : null}
        <div className="grid gap-6 break-words text-caption font-normal leading-normal">
          <div className="text-[var(--color-text-secondary)]">原文片段：{entry.sourceText}</div>
          <div className="text-[var(--color-text)]">质控规则：{entry.qualityRuleContent}</div>
          <div className="text-[var(--color-text)]">修改建议：{entry.suggestion}</div>
          {entry.notes ? <div className="text-[var(--color-text-secondary)]">备注：{entry.notes}</div> : null}
        </div>
      </div>
    </Card>
  )
}

function qualityRulePathFor(rules: ManualQualityRuleOption[], ruleId?: string) {
  if (!ruleId) return undefined
  const rule = rules.find((item) => item.id === ruleId)
  return rule ? [rule.category, rule.id] : undefined
}

function RuleOptionLabel({ rule }: { rule: ManualQualityRuleOption }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useLayoutEffect(() => {
    const node = textRef.current
    if (!node) return

    function measure() {
      if (!node) return
      setIsOverflowing(node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1)
    }

    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(node)
    return () => observer?.disconnect()
  }, [rule.content])

  return (
    <Tooltip
      title={isOverflowing ? rule.content : undefined}
      placement="right"
      overlayClassName="[&_.ant-tooltip-inner]:max-w-[480px] [&_.ant-tooltip-inner]:whitespace-pre-wrap"
    >
      <div className="max-w-[min(56vw,480px)] min-w-[320px] py-4">
        <span ref={textRef} className="line-clamp-2 whitespace-normal break-words text-base font-normal leading-normal text-[var(--color-text)]">
          {rule.content}
        </span>
      </div>
    </Tooltip>
  )
}

function SelectedRuleLabel({ text }: { text: string }) {
  return (
    <Tooltip
      title={text}
      placement="topLeft"
      overlayClassName="[&_.ant-tooltip-inner]:max-w-[480px] [&_.ant-tooltip-inner]:whitespace-pre-wrap"
    >
      <span className="block max-w-full truncate text-base font-normal text-[var(--color-text)]">{text}</span>
    </Tooltip>
  )
}

function EntryForm({
  formState,
  rules,
  forceValidationPreview,
  onCancel,
  onSave
}: {
  formState: ManualLayoutFormState
  rules: ManualQualityRuleOption[]
  forceValidationPreview?: boolean
  onCancel?: () => void
  onSave?: (values: ManualLayoutFormValue) => void
}) {
  const ruleOptions = useMemo(
    () =>
      Object.entries(
        rules.reduce<Record<string, ManualQualityRuleOption[]>>((groups, rule) => {
          const category = rule.category || 'unknown'
          groups[category] = [...(groups[category] ?? []), rule]
          return groups
        }, {})
      ).map(([category, categoryRules]): ManualRuleCascaderOption => ({
        value: category,
        label: categoryRules[0]?.categoryLabel ?? category,
        text: categoryRules[0]?.categoryLabel ?? category,
        searchText: `${category} ${categoryRules[0]?.categoryLabel ?? ''}`,
        children: categoryRules.map((rule) => ({
          value: rule.id,
          label: <RuleOptionLabel rule={rule} />,
          text: rule.content,
          searchText: `${rule.categoryLabel} ${rule.title} ${rule.content}`
        }))
      })),
    [rules]
  )
  const initialValues = useMemo<EntryFormValue>(
    () => ({
      ...formState.values,
      qualityRulePath: qualityRulePathFor(rules, formState.values.qualityRuleId)
    }),
    [formState.values, rules]
  )

  return (
    <Card
      size="small"
      className="border-[var(--color-primary-border)] bg-[var(--color-bg-container)] shadow-[var(--shadow-control-primary)] [&_.ant-card-body]:p-16"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-12 text-base font-semibold text-[var(--color-text)]">
        {formState.mode === 'edit' ? '编辑标注条目' : '新建标注条目'}
      </div>
      <Form<EntryFormValue>
        itemLayout="vertical"
        className="[&_.ant-form-item]:mb-12"
        initialValues={initialValues}
        onFinish={(values) => {
          const qualityRuleId = values.qualityRulePath?.[1]
          onSave?.({ ...formState.values, ...values, qualityRuleId })
        }}
      >
        <Form renderMode="item" label="原文片段" itemProps={{ name: 'sourceText' }}>
          <Input kind="textarea" disabled rows={3} />
        </Form>
        <Form
          renderMode="item"
          label="质控规则"
          requiredMarkContent="*"
          itemProps={{
            name: 'qualityRulePath',
            rules: [
              {
                validator: async (_, value) => {
                  if (Array.isArray(value) && value.length === 2) return
                  throw new Error('请选择具体质控规则')
                }
              }
            ],
            help: forceValidationPreview && !formState.values.qualityRuleId ? '请选择具体质控规则' : undefined
          }}
          validateStatus={forceValidationPreview && !formState.values.qualityRuleId ? 'error' : undefined}
        >
          <Cascader<ManualRuleCascaderOption>
            placeholder="先选择规则类型，再选择具体质控规则"
            searchable
            searchConfig={{
              filter: (input, path) =>
                path.some((option) => String(option.searchText ?? option.label).toLowerCase().includes(input.toLowerCase()))
            }}
            options={ruleOptions}
            displayRender={(_, selectedOptions) => {
              const selectedOption = selectedOptions?.[selectedOptions.length - 1] as ManualRuleCascaderOption | undefined
              const text = selectedOption?.text ?? ''
              return text ? <SelectedRuleLabel text={text} /> : null
            }}
            popupClassName="[&_.ant-cascader-menu]:min-w-[144px] [&_.ant-cascader-menu:first-child]:max-w-[168px] [&_.ant-cascader-menu:not(:first-child)]:min-w-[360px] [&_.ant-cascader-menu:not(:first-child)]:max-w-[520px] [&_.ant-cascader-menu-item]:h-auto [&_.ant-cascader-menu-item]:items-start [&_.ant-cascader-menu-item-content]:min-w-0 [&_.ant-cascader-menu-item-content]:whitespace-normal"
            className="w-full [&_.ant-select-selection-item]:min-w-0 [&_.ant-select-selection-placeholder]:text-[var(--color-text-disabled)]"
          />
        </Form>
        <Form
          renderMode="item"
          label="修改建议"
          itemProps={{
            name: 'suggestion',
            rules: [{ required: true, message: '请输入修改建议' }],
            help: forceValidationPreview && !formState.values.suggestion ? '请输入修改建议' : undefined
          }}
          validateStatus={forceValidationPreview && !formState.values.suggestion ? 'error' : undefined}
        >
          <Input kind="textarea" placeholder="请输入修改建议" rows={3} />
        </Form>
        <Form renderMode="item" label="备注" itemProps={{ name: 'notes' }}>
          <Input kind="textarea" placeholder="请输入备注" rows={2} />
        </Form>
        <div className="flex justify-end gap-8">
          <Button onClick={onCancel}>取消</Button>
          <Button color="primary" variant="solid" htmlType="submit">
            {formState.mode === 'edit' ? '保存修改' : '保存'}
          </Button>
        </div>
      </Form>
    </Card>
  )
}

export default function ManualAnnotationLayout({
  recordText,
  hospitalizationNo,
  entries,
  rules,
  readonly,
  formState,
  forceValidationPreview,
  recordHeaderAction,
  rightTitle,
  onSelectText,
  onEdit,
  onDelete,
  onCancelForm,
  onSaveForm
}: ManualAnnotationLayoutProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const syncingScrollRef = useRef<'left' | 'right' | null>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [measuredTops, setMeasuredTops] = useState<Map<number, number>>(new Map())
  const [measuredItemHeights, setMeasuredItemHeights] = useState<Map<string, number>>(new Map())
  const [canvasHeight, setCanvasHeight] = useState(720)
  const normalizedRecord = useMemo(() => normalizeRecordTextWithMap(recordText), [recordText])
  const displayText = normalizedRecord.text
  const layout = useMemo(
    () => layoutItems(displayText, normalizedRecord, entries, formState, measuredTops, measuredItemHeights),
    [displayText, normalizedRecord, entries, formState, measuredTops, measuredItemHeights]
  )
  const highlightRanges = useMemo(
    () =>
      [
        ...entries.map((entry) => ({
          id: entry.id,
          startOffset: displayOffsetForRawOffset(normalizedRecord, entry.startOffset),
          endOffset: displayEndOffsetForRawEnd(normalizedRecord, entry.endOffset),
          temporary: false
        })),
        ...(formState?.mode === 'create'
          ? [
              {
                id: 'draft-create',
                startOffset: displayOffsetForRawOffset(normalizedRecord, formState.values.startOffset),
                endOffset: displayEndOffsetForRawEnd(normalizedRecord, formState.values.endOffset),
                temporary: true
              }
            ]
          : [])
      ]
        .filter((entry) => entry.startOffset >= 0 && entry.endOffset > entry.startOffset)
        .sort((a, b) => a.startOffset - b.startOffset),
    [entries, formState, normalizedRecord]
  )
  const highlightSignature = useMemo(
    () =>
      [
        ...entries.map((entry) => `${entry.id}:${entry.startOffset}:${entry.endOffset}`),
        formState?.mode === 'create' ? `draft:${formState.values.startOffset}:${formState.values.endOffset}` : ''
      ].join('|'),
    [entries, formState]
  )

  useLayoutEffect(() => {
    const content = contentRef.current
    const container = textRef.current
    if (!content || !container) return

    const offsets = new Set<number>(entries.map((entry) => entry.startOffset))
    if (formState) offsets.add(formState.values.startOffset)

    const textNodes: Text[] = []
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      textNodes.push(node as Text)
      node = walker.nextNode()
    }

    const containerRect = container.getBoundingClientRect()
    const next = new Map<number, number>()
    offsets.forEach((rawOffset) => {
      const offset = displayOffsetForRawOffset(normalizedRecord, rawOffset)
      let cursor = 0
      for (const textNode of textNodes) {
        const length = textNode.textContent?.length ?? 0
        if (offset >= cursor && offset <= cursor + length) {
          const range = document.createRange()
          const relativeOffset = Math.min(length, Math.max(0, offset - cursor))
          range.setStart(textNode, relativeOffset)
          range.setEnd(textNode, Math.min(length, relativeOffset + 1))
          const rect = range.getBoundingClientRect()
          if (rect.height > 0) {
            next.set(rawOffset, Math.max(0, rect.top - containerRect.top + container.scrollTop))
          }
          range.detach()
          break
        }
        cursor += length
      }
    })
    setMeasuredTops(next)
  }, [entries, formState, normalizedRecord, displayText])

  useLayoutEffect(() => {
    const next = new Map<string, number>()
    itemRefs.current.forEach((node, key) => {
      next.set(key, Math.ceil(node.getBoundingClientRect().height))
    })
    setMeasuredItemHeights((current) => (mapsEqual(current, next) ? current : next))
  })

  useLayoutEffect(() => {
    if (selectedEntryId && !entries.some((entry) => entry.id === selectedEntryId)) {
      setSelectedEntryId(null)
    }
  }, [entries, selectedEntryId])

  useLayoutEffect(() => {
    syncingScrollRef.current = null
    setSelection(null)
    setSelectedEntryId(null)
    if (textRef.current) textRef.current.scrollTop = 0
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0
  }, [recordText, hospitalizationNo])

  useLayoutEffect(() => {
    const leftHeight = textRef.current?.scrollHeight ?? 0
    setCanvasHeight(Math.max(720, leftHeight, layout.minHeight))
  }, [layout.minHeight, displayText])

  useLayoutEffect(() => {
    if (!formState) return
    if (!measuredTops.has(formState.values.startOffset)) return
    scrollBothToOffset(formState.values.startOffset)
  }, [formState, measuredTops])

  function syncScroll(source: 'left' | 'right') {
    if (syncingScrollRef.current && syncingScrollRef.current !== source) return
    const from = source === 'left' ? textRef.current : rightScrollRef.current
    const to = source === 'left' ? rightScrollRef.current : textRef.current
    if (!from || !to) return

    syncingScrollRef.current = source
    to.scrollTop = from.scrollTop
    window.requestAnimationFrame(() => {
      syncingScrollRef.current = null
    })
  }

  function scrollBothToOffset(offset: number) {
    const top = measuredTopFor(displayText, normalizedRecord, offset, measuredTops)
    const targetTop = Math.max(0, top - 24)
    syncingScrollRef.current = null
    if (textRef.current) textRef.current.scrollTo({ top: targetTop, behavior: 'smooth' })
    if (rightScrollRef.current) rightScrollRef.current.scrollTo({ top: targetTop, behavior: 'smooth' })
  }

  function captureSelection() {
    if (readonly || !onSelectText) return
    const windowSelection = window.getSelection()
    const rawSelected = windowSelection?.toString() ?? ''
    const selected = rawSelected.trim()
    if (!selected) {
      setSelection(null)
      return
    }
    const range = windowSelection?.rangeCount ? windowSelection.getRangeAt(0) : null
    const rangeRect = range?.getBoundingClientRect()
    const containerRect = textRef.current?.getBoundingClientRect()
    const content = contentRef.current
    const rangeContainer = range?.commonAncestorContainer
    const rangeElement = rangeContainer?.nodeType === Node.TEXT_NODE ? rangeContainer.parentElement : rangeContainer
    if (!range || !rangeRect || !containerRect || !textRef.current || !content || !rangeElement || !content.contains(rangeElement)) return

    const prefixRange = document.createRange()
    prefixRange.setStart(content, 0)
    prefixRange.setEnd(range.startContainer, range.startOffset)
    const leadingTrimLength = rawSelected.length - rawSelected.trimStart().length
    const trailingTrimLength = rawSelected.length - rawSelected.trimEnd().length
    const rawStart = prefixRange.toString().length
    const displayStart = rawStart + leadingTrimLength
    const displayEnd = rawStart + rawSelected.length - trailingTrimLength
    prefixRange.detach()
    if (displayStart < 0 || displayEnd <= displayStart || displayText.slice(displayStart, displayEnd) !== selected) return
    const start = rawOffsetForDisplayOffset(normalizedRecord, displayStart, 0)
    const end = rawEndOffsetForDisplayEnd(normalizedRecord, displayEnd, recordText.length)
    const buttonLeft = Math.min(
      Math.max(16, rangeRect.right - containerRect.left + textRef.current.scrollLeft + 8),
      textRef.current.scrollWidth - 80
    )
    const buttonTop = Math.min(
      Math.max(16, rangeRect.bottom - containerRect.top + textRef.current.scrollTop + 8),
      textRef.current.scrollHeight - 40
    )
    setSelection({
      sourceText: selected,
      startOffset: start,
      endOffset: end,
      buttonLeft,
      buttonTop
    })
  }

  function clearTransientState() {
    setSelectedEntryId(null)
    setSelection(null)
  }

  function bindItemRef(key: string) {
    return (node: HTMLDivElement | null) => {
      if (node) {
        itemRefs.current.set(key, node)
      } else {
        itemRefs.current.delete(key)
      }
    }
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(520px,760px)_minmax(420px,1fr)] gap-16 p-20">
      <section className="flex min-h-0 flex-col rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16">
        <div className="mb-12 flex items-center justify-between gap-12">
          <h2 className="m-0 truncate text-lg font-semibold text-[var(--color-text)]">住院号：{hospitalizationNo}</h2>
          {recordHeaderAction}
        </div>
        <div
          ref={textRef}
          className="relative min-h-0 flex-1 overflow-auto rounded-md bg-[var(--color-fill-quaternary)] p-16 text-base leading-[32px] text-[var(--color-text)]"
          onMouseUp={captureSelection}
          onClick={() => setSelectedEntryId(null)}
          onScroll={() => syncScroll('left')}
        >
          <div key={highlightSignature} ref={contentRef} className="whitespace-pre-wrap">
            {renderHighlightedText(displayText, highlightRanges, selectedEntryId)}
          </div>
          {selection ? (
            <Button
              color="primary"
              variant="solid"
              className="absolute z-10 shadow-[var(--shadow-control-primary)]"
              style={{ left: selection.buttonLeft, top: selection.buttonTop }}
              onClick={(event) => {
                event.stopPropagation()
                onSelectText?.(selection)
                setSelection(null)
                window.getSelection()?.removeAllRanges()
              }}
            >
              标注
            </Button>
          ) : null}
        </div>
      </section>
      <section
        className="relative min-h-0 overflow-hidden rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-container)] p-16"
        onClick={clearTransientState}
      >
        {rightTitle ? (
          <div className="mb-12 flex items-center justify-between gap-12">
            <h2 className="m-0 text-lg font-semibold text-[var(--color-text)]">{rightTitle}</h2>
          </div>
        ) : null}
        {entries.length === 0 && !formState ? (
          <div
            className={cx(
              'flex items-center justify-center rounded-md border border-[var(--color-border-secondary)] bg-[var(--color-fill-quaternary)]',
              rightTitle ? 'h-[calc(100%-44px)]' : 'h-full'
            )}
          >
            <Empty imageVariant="blueSimple" description={readonly ? '暂无质控问题条目' : '划选左侧病历原文后点击“标注”创建条目'} />
          </div>
        ) : null}
        <div ref={rightScrollRef} className={cx('absolute inset-x-0 bottom-0 overflow-auto', rightTitle ? 'top-[56px]' : 'top-16')} onScroll={() => syncScroll('right')}>
          <div className="relative" style={{ minHeight: canvasHeight }}>
            {layout.visibleEntries.map((entry) => (
              <div
                key={entry.id}
                ref={bindItemRef(`entry:${entry.id}`)}
                style={{ top: layout.entryTops.get(entry.id) ?? lineTop(displayText, displayOffsetForRawOffset(normalizedRecord, entry.startOffset)) }}
                className="absolute left-0 right-0"
              >
                <EntryCard
                  entry={entry}
                  readonly={readonly}
                  selected={selectedEntryId === entry.id}
                  onSelect={(selectedEntry) => {
                    setSelectedEntryId(selectedEntry.id)
                    scrollBothToOffset(selectedEntry.startOffset)
                  }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
            {formState ? (
              <div
                ref={bindItemRef('form')}
                className="absolute left-16 right-16 z-10"
                style={{ top: layout.formTop ?? measuredTopFor(displayText, normalizedRecord, formState.values.startOffset, measuredTops) }}
              >
                <EntryForm
                  formState={formState}
                  rules={rules}
                  forceValidationPreview={forceValidationPreview}
                  onCancel={onCancelForm}
                  onSave={onSaveForm}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
