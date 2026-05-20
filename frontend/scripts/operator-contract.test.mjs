import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

test('operator routes expose list and workbench entries', () => {
  const app = read('src/app/App.tsx')
  assert.match(app, /path="\/operator"/)
  assert.match(app, /path="\/operator\/plans"/)
  assert.match(app, /path="\/operator\/plans\/:planId\/annotate"/)
  assert.match(app, /ProtectedRoute role="operator"/)
})

test('operator annotation modal keeps required decision and reason choices', () => {
  const format = read('src/pages/operator/operator-format.ts')
  assert.match(format, /BOTH_BAD:\s*'都不好'/)
  assert.match(format, /NO_OVER_QC:\s*'无过度质控'/)
  assert.match(format, /NO_HIT_ERROR_RULE:\s*'无命中错误规则'/)
  assert.match(format, /NO_MISSING_RULE:\s*'无遗漏规则'/)
  assert.match(format, /A_BETTER:\s*'A 更好'/)
  assert.match(format, /B_BETTER:\s*'B 更好'/)
})

test('operator login lands on plan list before entering any specific workbench', () => {
  const login = read('src/pages/auth/login-page.tsx')
  assert.match(login, /response\.user\.role === 'admin' \? '\/admin\/plans' : '\/operator\/plans'/)
})

test('operator pages keep all design states addressable', () => {
  const plans = read('src/pages/operator/operator-plans-page.tsx')
  const annotate = read('src/pages/operator/operator-annotate-page.tsx')
  for (const state of ['loading', 'empty', 'error']) {
    assert.match(plans, new RegExp(`previewState === '${state}'`))
  }
  for (const state of ['loading', 'error', 'forbidden', 'closed', 'complete', 'modal', 'validation', 'submitting']) {
    assert.match(annotate, new RegExp(`previewState === '${state}'`))
  }
})

test('operator list prevents completed and closed plans from entering workbench', () => {
  const list = read('src/pages/operator/components/plan-list.tsx')
  assert.match(list, /plan\.status === 'closed' \|\| plan\.status === 'completed'/)
  assert.match(list, /return '已关闭'/)
  assert.match(list, /return '已完成'/)
  assert.match(list, /return '开始标注'/)
  assert.match(list, /formatUpdatedAt/)
  assert.match(list, /replace\('T', ' '\)/)
})

test('operator workbench keeps the three-column review layout', () => {
  const workbench = read('src/pages/operator/components/annotation-workbench.tsx')
  assert.match(workbench, /grid-cols-3/)
  assert.match(workbench, /MedicalRecordPanel/)
  assert.match(workbench, /ModelOutputPanel output=\{task\.outputs\[0\]\}/)
  assert.match(workbench, /ModelOutputPanel output=\{task\.outputs\[1\]\}/)
  const content = read('src/pages/operator/components/content-panels.tsx')
  assert.match(content, /结果 \{output\.side\}/)
  assert.doesNotMatch(content, /documentTypeLabel/)
  assert.doesNotMatch(content, />标注结果</)
})

test('quality rules popover supports document tabs without replacing record content', () => {
  const popover = read('src/pages/operator/components/quality-rules-popover.tsx')
  assert.match(popover, /Popover/)
  assert.match(popover, /placement="rightTop"/)
  assert.match(popover, /Tabs/)
  assert.match(popover, /placement="left"/)
  assert.match(popover, /admission_record_child/)
  assert.match(popover, /admission_record_female/)
  assert.match(popover, /admission_record_male/)
  assert.match(popover, /overflow-y-auto/)
  assert.doesNotMatch(popover, /rule\.description/)
  assert.doesNotMatch(popover, /rule\.score\} 分/)
})

test('operator rich text parser recognizes headings followed by markdown tables', () => {
  const richText = read('src/pages/operator/components/rich-text.tsx')
  assert.match(richText, /startsTable\(lines, index\)/)
  assert.match(richText, /renderTable\(tableLines/)
  assert.match(richText, /isHeading\(line\)/)
  assert.ok(richText.includes(".replace(/\\\\r\\\\n|\\\\n|\\\\r/g, '\\n')"))
  assert.ok(richText.includes(".replace(/\\|\\s+\\|/g, '|\\n|')"))
})

test('annotation form validates required decision, reason and other reason', () => {
  const modal = read('src/pages/operator/components/annotation-modal.tsx')
  assert.match(modal, /message: '请选择标注结论'/)
  assert.match(modal, /new Error\('请选择标注原因'\)/)
  assert.match(modal, /new Error\('请填写其他原因'\)/)
  assert.match(modal, /mask/)
})

test('mock submission advances task state and exposes completion result', () => {
  const mock = read('src/mocks/operator.ts')
  assert.match(mock, /submittedTaskIds\.add\(taskId\)/)
  assert.match(mock, /next_task: nextTask/)
  assert.match(mock, /completed: !nextTask/)
})

test('operator api defaults to backend mode, keeps mock switch and declares backend endpoints', () => {
  const api = read('src/api/operator.ts')
  assert.match(api, /VITE_OPERATOR_API_MODE === 'mock'/)
  assert.match(api, /\/operator\/plans/)
  assert.match(api, /\/operator\/plans\/\$\{planId\}\/tasks\/next/)
  assert.match(api, /\/operator\/tasks\/\$\{taskId\}\/annotate/)
  assert.match(api, /mapPlan/)
  assert.match(api, /mapTask/)
  assert.match(api, /formatBackendDateTime/)
  assert.match(api, /score: rule\.score/)
})

test('manual annotation mode exposes plan type, manual submit api and mock task data', () => {
  const operatorTypes = read('src/types/operator.ts')
  const api = read('src/api/operator.ts')
  const mock = read('src/mocks/operator.ts')
  assert.match(operatorTypes, /OperatorPlanAnnotationType = 'comparison' \| 'manual'/)
  assert.match(operatorTypes, /ManualAnnotationSubmitPayload/)
  assert.match(api, /submitManualAnnotation/)
  assert.match(api, /\/operator\/tasks\/\$\{taskId\}\/manual-annotate/)
  assert.match(mock, /annotation_type: 'manual'/)
  assert.match(mock, /submittedManualTaskIds\.add\(taskId\)/)
  assert.match(mock, /ANNOTATION_ALREADY_EXISTS/)
})

test('manual workbench supports offset highlight, card crud and submit confirmation', () => {
  const layout = read('src/pages/shared/manual-annotation-layout.tsx')
  const workbench = read('src/pages/operator/components/manual-annotation-workbench.tsx')
  const dialog = read('src/components/feedback/modal-dialog.tsx')
  const empty = read('src/components/data-display/empty.tsx')
  const table = read('src/components/data-display/table.tsx')
  const mock = read('src/mocks/operator.ts')
  assert.match(layout, /renderHighlightedText/)
  assert.match(layout, /startOffset/)
  assert.match(layout, /endOffset/)
  assert.match(layout, /getBoundingClientRect/)
  assert.match(layout, /buttonLeft/)
  assert.match(layout, /selectedEntryId/)
  assert.match(layout, /color-error-bg-active/)
  assert.match(layout, /contentRef/)
  assert.match(layout, /rightScrollRef/)
  assert.match(layout, /syncScroll/)
  assert.match(layout, /scrollBothToOffset/)
  assert.match(layout, /prefixRange\.toString\(\)\.length/)
  assert.doesNotMatch(layout, /recordText\.indexOf\(selected\)/)
  assert.match(layout, /draft-create/)
  assert.match(layout, /formState\?\.mode === 'create'/)
  assert.match(layout, /!measuredTops\.has\(formState\.values\.startOffset\)/)
  assert.match(layout, /highlightSignature/)
  assert.match(layout, /measuredItemHeights/)
  assert.match(layout, /getBoundingClientRect\(\)\.height/)
  assert.match(layout, /bindItemRef/)
  assert.match(layout, /!h-\[24px\]/)
  assert.match(layout, /absolute right-0 top-0/)
  assert.doesNotMatch(layout, /问题 \{entry\.id\}/)
  assert.doesNotMatch(layout, /min-h-\[176px\]/)
  assert.match(layout, /layoutItems/)
  assert.match(layout, /border-\[var\(--color-primary-active\)\]/)
  assert.match(layout, /bg-\[var\(--color-primary-bg\)\]/)
  assert.match(layout, /hover:border-\[var\(--color-primary-border\)\]/)
  assert.match(layout, /hover:!bg-\[var\(--color-error\)\]/)
  assert.match(layout, /active:!bg-\[var\(--color-error-active\)\]/)
  assert.match(layout, /onDelete/)
  assert.match(layout, /Cascader/)
  assert.match(layout, /qualityRulePath/)
  assert.match(layout, /请选择具体质控规则/)
  assert.match(layout, /先选择规则类型，再选择具体质控规则/)
  assert.match(layout, /searchConfig/)
  assert.match(layout, /请输入修改建议/)
  assert.match(layout, /imageVariant="blueSimple"/)
  for (const state of ['default', 'new', 'edit', 'validation', 'delete', 'confirm-has', 'confirm-none']) {
    assert.match(workbench, new RegExp(`previewState === '${state}'`))
  }
  assert.match(workbench, /当前病历已标记/)
  assert.match(workbench, /当前病历未标记质控问题/)
  assert.match(workbench, /ConfirmationContent/)
  assert.match(workbench, /footerContentType="slot"/)
  assert.match(workbench, /function deleteEntry/)
  assert.match(workbench, /current\.mode === 'edit' && current\.entryId === target\.id/)
  assert.match(workbench, /rules\.length === 0/)
  assert.match(workbench, /categoryLabel/)
  assert.match(workbench, /documentTypeLabel/)
  assert.match(workbench, /previewState === 'confirm-none'/)
  assert.match(workbench, /标注条目已保存/)
  assert.match(workbench, /result: entries\.length > 0 \? 'has_issues' : 'no_issue'/)
  assert.match(dialog, /modalProps\.onCancel/)
  assert.match(dialog, /modalProps\.onOk/)
  assert.match(empty, /imageVariant = 'blueSimple'/)
  assert.doesNotMatch(table, /PRESENTED_IMAGE_SIMPLE/)
  assert.match(mock, /const manualRecordBase = \[/)
  assert.match(mock, /Array\.from\(\{ length: 10 \}/)
  assert.match(mock, /上级医师查房意见/)
  assert.match(mock, /\.join\('\\n\\n'\)/)
})

test('admin manual reporting exposes aggregate list and read-only detail route', () => {
  const app = read('src/app/App.tsx')
  const api = read('src/api/admin-plans.ts')
  const mock = read('src/mocks/admin-plans.ts')
  const detail = read('src/pages/admin/admin-manual-annotation-detail-page.tsx')
  const annotations = read('src/pages/admin/components/annotation-detail-section.tsx')
  assert.match(app, /\/admin\/plans\/:id\/annotations\/:manualAnnotationId/)
  assert.match(api, /VITE_ADMIN_API_MODE === 'mock'/)
  assert.match(api, /fetchManualAnnotationDetail/)
  assert.match(mock, /problem_count/)
  assert.match(mock, /start_offset/)
  assert.match(annotations, /manual_annotation_id/)
  assert.match(detail, /工作台视图/)
  assert.match(detail, /列表视图/)
})
