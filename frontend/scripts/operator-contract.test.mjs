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
  assert.match(popover, /'admission', 'first_course', 'superior_round', 'daily_course', 'discharge'/)
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
