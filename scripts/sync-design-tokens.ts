import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type ThemeMode = 'light' | 'dark'

type PencilTokenValue =
  | string
  | number
  | boolean
  | Array<{
      value: string | number | boolean
      theme?: {
        mode?: ThemeMode
      }
    }>

type PencilVariable = {
  type: 'color' | 'number' | 'string' | 'boolean'
  value: PencilTokenValue
}

type RuntimeToken = {
  name: string
  type: PencilVariable['type']
  category: string
  value: unknown
  light: string | null
  dark: string | null
  cssVariable: string | null
  runtimeKind: 'css-variable' | 'media-query' | 'responsive-rule'
}

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const tokenSourcePath = join(rootDir, 'design/tokens.lib.pen')
const stylesDir = join(rootDir, 'frontend/src/styles')
const tailwindConfigPath = join(rootDir, 'frontend/tailwind.config.ts')

const source = JSON.parse(readFileSync(tokenSourcePath, 'utf8')) as {
  variables: Record<string, PencilVariable>
}

const variables = source.variables
const tokenNames = Object.keys(variables).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

const semanticColorNames = [
  'color-primary',
  'color-primary-hover',
  'color-primary-active',
  'color-primary-bg',
  'color-primary-bg-hover',
  'color-primary-border',
  'color-primary-border-hover',
  'color-success',
  'color-success-hover',
  'color-success-active',
  'color-success-bg',
  'color-success-bg-hover',
  'color-success-border',
  'color-success-border-hover',
  'color-warning',
  'color-warning-hover',
  'color-warning-active',
  'color-warning-bg',
  'color-warning-bg-hover',
  'color-warning-border',
  'color-warning-border-hover',
  'color-error',
  'color-error-hover',
  'color-error-active',
  'color-error-bg',
  'color-error-bg-hover',
  'color-error-border',
  'color-error-border-hover',
  'color-info',
  'color-info-hover',
  'color-info-active',
  'color-info-bg',
  'color-info-bg-hover',
  'color-info-border',
  'color-info-border-hover',
  'color-link',
  'color-link-hover',
  'color-link-active',
  'color-text',
  'color-text-secondary',
  'color-text-tertiary',
  'color-text-quaternary',
  'color-text-disabled',
  'color-text-heading',
  'color-text-label',
  'color-text-description',
  'color-text-placeholder',
  'color-bg-base',
  'color-bg-layout',
  'color-bg-container',
  'color-bg-elevated',
  'color-bg-spotlight',
  'color-bg-mask',
  'color-bg-container-disabled',
  'color-border',
  'color-border-secondary',
  'color-split',
  'color-fill',
  'color-fill-secondary',
  'color-fill-tertiary',
  'color-fill-quaternary',
  'color-icon',
  'color-icon-hover'
].filter(hasToken)

const antdSeedTokenMap: Record<string, string> = {
  colorPrimary: 'color-primary',
  colorSuccess: 'color-success',
  colorWarning: 'color-warning',
  colorError: 'color-error',
  colorInfo: 'color-info',
  borderRadius: 'radius',
  fontFamily: 'font-family-base',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  lineWidth: 'line-width',
  motionUnit: 'motion-unit'
}

const antdMapTokenMap: Record<string, string> = {
  colorPrimaryBg: 'color-primary-bg',
  colorPrimaryBgHover: 'color-primary-bg-hover',
  colorPrimaryBorder: 'color-primary-border',
  colorPrimaryBorderHover: 'color-primary-border-hover',
  colorPrimaryHover: 'color-primary-hover',
  colorPrimaryActive: 'color-primary-active',
  colorSuccessBg: 'color-success-bg',
  colorSuccessBgHover: 'color-success-bg-hover',
  colorSuccessBorder: 'color-success-border',
  colorSuccessBorderHover: 'color-success-border-hover',
  colorSuccessHover: 'color-success-hover',
  colorSuccessActive: 'color-success-active',
  colorWarningBg: 'color-warning-bg',
  colorWarningBgHover: 'color-warning-bg-hover',
  colorWarningBorder: 'color-warning-border',
  colorWarningBorderHover: 'color-warning-border-hover',
  colorWarningHover: 'color-warning-hover',
  colorWarningActive: 'color-warning-active',
  colorErrorBg: 'color-error-bg',
  colorErrorBgHover: 'color-error-bg-hover',
  colorErrorBorder: 'color-error-border',
  colorErrorBorderHover: 'color-error-border-hover',
  colorErrorHover: 'color-error-hover',
  colorErrorActive: 'color-error-active',
  colorInfoBg: 'color-info-bg',
  colorInfoBgHover: 'color-info-bg-hover',
  colorInfoBorder: 'color-info-border',
  colorInfoBorderHover: 'color-info-border-hover',
  colorInfoHover: 'color-info-hover',
  colorInfoActive: 'color-info-active'
}

const antdAliasTokenMap: Record<string, string> = {
  colorText: 'color-text',
  colorTextSecondary: 'color-text-secondary',
  colorTextTertiary: 'color-text-tertiary',
  colorTextQuaternary: 'color-text-quaternary',
  colorTextDisabled: 'color-text-disabled',
  colorBgBase: 'color-bg-base',
  colorBgContainer: 'color-bg-container',
  colorBgElevated: 'color-bg-elevated',
  colorBgLayout: 'color-bg-layout',
  colorBgSpotlight: 'color-bg-spotlight',
  colorBgMask: 'color-bg-mask',
  colorBorder: 'color-border',
  colorBorderSecondary: 'color-border-secondary',
  colorSplit: 'color-split',
  colorFill: 'color-fill',
  colorFillSecondary: 'color-fill-secondary',
  colorFillTertiary: 'color-fill-tertiary',
  colorFillQuaternary: 'color-fill-quaternary',
  colorIcon: 'color-icon',
  colorIconHover: 'color-icon-hover',
  colorLink: 'color-link',
  colorLinkHover: 'color-link-hover',
  colorLinkActive: 'color-link-active',
  colorTextPlaceholder: 'color-text-placeholder',
  controlHeight: 'control-height',
  controlHeightSM: 'control-height-sm',
  controlHeightLG: 'control-height-lg',
  controlHeightXS: 'control-height-xs',
  controlOutline: 'control-outline',
  controlOutlineWidth: 'control-outline-width',
  controlItemBgHover: 'control-item-bg-hover',
  controlItemBgActive: 'control-item-bg-active',
  controlItemBgActiveHover: 'control-item-bg-active-hover',
  controlItemBgActiveDisabled: 'control-item-bg-active-disabled',
  padding: 'padding',
  paddingXS: 'padding-xs',
  paddingSM: 'padding-sm',
  paddingMD: 'padding-md',
  paddingLG: 'padding-lg',
  paddingXL: 'padding-xl',
  margin: 'margin',
  marginXS: 'margin-xs',
  marginSM: 'margin-sm',
  marginMD: 'margin-md',
  marginLG: 'margin-lg',
  marginXL: 'margin-xl',
  boxShadow: 'shadow-control',
  boxShadowSecondary: 'shadow-handle',
  zIndexPopupBase: 'z-index-popup-base'
}

const componentPrefixes: Record<string, string> = {
  alert: 'Alert',
  anchor: 'Anchor',
  'auto-complete': 'AutoComplete',
  avatar: 'Avatar',
  badge: 'Badge',
  breadcrumb: 'Breadcrumb',
  button: 'Button',
  calendar: 'Calendar',
  card: 'Card',
  carousel: 'Carousel',
  cascader: 'Cascader',
  checkbox: 'Checkbox',
  collapse: 'Collapse',
  'date-picker': 'DatePicker',
  descriptions: 'Descriptions',
  divider: 'Divider',
  drawer: 'Drawer',
  dropdown: 'Dropdown',
  form: 'Form',
  image: 'Image',
  input: 'Input',
  layout: 'Layout',
  list: 'List',
  mentions: 'Mentions',
  menu: 'Menu',
  message: 'Message',
  modal: 'Modal',
  notification: 'Notification',
  pagination: 'Pagination',
  popconfirm: 'Popconfirm',
  popover: 'Popover',
  progress: 'Progress',
  radio: 'Radio',
  rate: 'Rate',
  result: 'Result',
  segmented: 'Segmented',
  select: 'Select',
  skeleton: 'Skeleton',
  slider: 'Slider',
  spin: 'Spin',
  splitter: 'Splitter',
  statistic: 'Statistic',
  steps: 'Steps',
  switch: 'Switch',
  table: 'Table',
  tabs: 'Tabs',
  tag: 'Tag',
  'time-picker': 'TimePicker',
  timeline: 'Timeline',
  tooltip: 'Tooltip',
  tour: 'Tour',
  transfer: 'Transfer',
  tree: 'Tree',
  typography: 'Typography',
  upload: 'Upload'
}

const sortedComponentPrefixes = Object.keys(componentPrefixes).sort((a, b) => b.length - a.length)

function hasToken(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(variables, name)
}

function isThemedValue(value: PencilTokenValue): value is Array<{ value: string | number | boolean; theme?: { mode?: ThemeMode } }> {
  return Array.isArray(value)
}

function themeValue(variable: PencilVariable, mode: ThemeMode): string | number | boolean {
  const value = variable.value

  if (!isThemedValue(value)) {
    return value
  }

  return value.find((entry) => entry.theme?.mode === mode)?.value ?? value[0]?.value ?? ''
}

function isPaletteColor(name: string): boolean {
  return /^color-[a-z]+-\d+(-dark)?$/.test(name)
}

function isResponsiveRuntimeOnly(name: string): boolean {
  return (
    name.startsWith('responsive-query-') ||
    name.startsWith('responsive-hide-on-') ||
    name.startsWith('responsive-only-')
  )
}

function runtimeKind(name: string): RuntimeToken['runtimeKind'] {
  if (name.startsWith('responsive-query-')) {
    return 'media-query'
  }

  if (name.startsWith('responsive-hide-on-') || name.startsWith('responsive-only-')) {
    return 'responsive-rule'
  }

  return 'css-variable'
}

function categoryFor(name: string): string {
  if (name.startsWith('seed-')) return 'Seed'
  if (isPaletteColor(name)) return 'Palette Color'
  if (name.startsWith('color-')) return 'Semantic Color'
  if (name.startsWith('font-') || name.startsWith('line-height')) return 'Typography'
  if (name.startsWith('space-') || name.startsWith('padding') || name.startsWith('margin')) return 'Spacing'
  if (name.startsWith('radius')) return 'Radius'
  if (name.startsWith('shadow-')) return 'Shadow'
  if (name.startsWith('screen-') || name.startsWith('responsive-')) return 'Responsive'
  if (name.startsWith('motion-')) return 'Motion'
  if (name.startsWith('opacity-')) return 'Opacity'
  if (name.startsWith('control-') || name.startsWith('size-')) return 'Control / Size'
  if (name.startsWith('z-index-')) return 'Z-index'
  if (componentMatch(name)) return 'Component'
  return 'Alias'
}

function componentMatch(name: string): { component: string; prefix: string; rest: string } | null {
  for (const prefix of sortedComponentPrefixes) {
    if (name === prefix || name.startsWith(`${prefix}-`)) {
      if (prefix === 'layout' && name.startsWith('layout-shell-')) {
        return null
      }

      return {
        component: componentPrefixes[prefix],
        prefix,
        rest: name.slice(prefix.length + 1)
      }
    }
  }

  return null
}

function needsPxUnit(name: string): boolean {
  if (
    name.startsWith('line-height') ||
    name.includes('-line-height') ||
    name.startsWith('font-weight') ||
    name.includes('-font-weight') ||
    name.startsWith('opacity-') ||
    name.startsWith('z-index-') ||
    name.includes('-z-index') ||
    name.includes('-zindex') ||
    name === 'seed-wireframe'
  ) {
    return false
  }

  if (name.startsWith('motion-duration-') || name === 'motion-unit' || name === 'seed-motion-unit') {
    return false
  }

  return true
}

function formatPrimitive(name: string, value: string | number | boolean): string {
  if (typeof value === 'boolean') return String(value)

  if (typeof value === 'number') {
    if (name.startsWith('motion-duration-') || name === 'motion-unit' || name === 'seed-motion-unit') {
      return `${trimNumber(value)}s`
    }

    if (needsPxUnit(name)) {
      return `${trimNumber(value)}px`
    }

    return trimNumber(value)
  }

  return value.replace(/\$([a-z0-9-]+)/gi, (_match, tokenName: string) => `var(--${tokenName})`)
}

function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)))
}

function cssValue(name: string, mode: ThemeMode): string | null {
  if (isResponsiveRuntimeOnly(name)) {
    return null
  }

  return formatPrimitive(name, themeValue(variables[name], mode))
}

function cssVar(name: string): string {
  return `var(--${name})`
}

function cssVarLine(name: string, mode: ThemeMode): string {
  return `  --${name}: ${cssValue(name, mode)};`
}

function tokenKey(name: string, prefix: string): string {
  const key = name.slice(prefix.length)
  return key === '' ? 'DEFAULT' : key
}

function camelCase(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase())
}

function pascalSafeObjectLiteral(entries: Array<[string, unknown]>, indent = 4): string {
  const pad = ' '.repeat(indent)
  const inner = ' '.repeat(indent + 2)

  if (entries.length === 0) return '{}'

  return `{\n${entries
    .map(([key, value]) => `${inner}${JSON.stringify(key)}: ${literal(value, indent + 2)}`)
    .join(',\n')}\n${pad}}`
}

function literal(value: unknown, indent = 0): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => literal(item, indent)).join(', ')}]`
  }

  if (value && typeof value === 'object') {
    return pascalSafeObjectLiteral(Object.entries(value as Record<string, unknown>), indent)
  }

  return JSON.stringify(value)
}

function makeTokenEntries(names: string[], prefix: string): Array<[string, string]> {
  return names.map((name) => [tokenKey(name, prefix), cssVar(name)])
}

function makeColorEntries(): Array<[string, string]> {
  return tokenNames
    .filter((name) => name.startsWith('color-'))
    .filter((name) => !name.endsWith('-dark'))
    .map((name) => [tokenKey(name, 'color-'), cssVar(name)])
}

function makeFontSizeEntries(): Array<[string, unknown]> {
  return tokenNames
    .filter((name) => name.startsWith('font-size'))
    .map((name) => {
      const key = name === 'font-size' ? 'base' : tokenKey(name, 'font-size-')
      const lineHeightName = name.startsWith('font-size-heading-')
        ? name.replace('font-size-', 'line-height-')
        : name === 'font-size'
          ? 'line-height'
          : name.replace('font-size-', 'line-height-')
      const lineHeight = hasToken(lineHeightName) ? cssVar(lineHeightName) : cssVar('line-height')

      return [key, [cssVar(name), { lineHeight }]]
    })
}

function makeScreens(): Array<[string, string]> {
  return ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    .map((key): [string, string] => {
      const name = `screen-${key}`
      return [key, `${themeValue(variables[name], 'light')}px`]
    })
    .filter(([key]) => hasToken(`screen-${key}`))
}

function makeTransitionDurations(): Array<[string, string]> {
  return tokenNames
    .filter((name) => name.startsWith('motion-duration-'))
    .map((name) => [tokenKey(name, 'motion-duration-'), cssVar(name)])
}

function makeTransitionTimingFunctions(): Array<[string, string]> {
  return tokenNames
    .filter((name) => name.startsWith('motion-ease-'))
    .map((name) => [tokenKey(name, 'motion-ease-'), cssVar(name)])
}

function makeZIndexEntries(): Array<[string, string]> {
  return tokenNames
    .filter((name) => name.startsWith('z-index-'))
    .map((name) => [camelCase(tokenKey(name, 'z-index-')), cssVar(name)])
}

function makeAntdEntries(mapping: Record<string, string>): Array<[string, string]> {
  return Object.entries(mapping)
    .filter(([, tokenName]) => hasToken(tokenName))
    .map(([antdName, tokenName]) => [antdName, cssVar(tokenName)])
}

function makeComponentTokenEntries(): Array<[string, Record<string, string>]> {
  const components: Record<string, Record<string, string>> = {}

  for (const name of tokenNames) {
    const match = componentMatch(name)

    if (!match) continue

    components[match.component] ??= {}
    components[match.component][camelCase(match.rest)] = cssVar(name)
  }

  return Object.entries(components).sort(([a], [b]) => a.localeCompare(b))
}

function buildRuntimeTokens(): Record<string, RuntimeToken> {
  return Object.fromEntries(
    tokenNames.map((name) => {
      const variable = variables[name]
      const kind = runtimeKind(name)

      return [
        name,
        {
          name,
          type: variable.type,
          category: categoryFor(name),
          value: variable.value,
          light: cssValue(name, 'light'),
          dark: isThemedValue(variable.value) ? cssValue(name, 'dark') : null,
          cssVariable: kind === 'css-variable' ? `--${name}` : null,
          runtimeKind: kind
        }
      ]
    })
  )
}

function buildGlobalsCss(): string {
  const cssVariableNames = tokenNames.filter((name) => !isResponsiveRuntimeOnly(name))
  const themedNames = cssVariableNames.filter((name) => isThemedValue(variables[name].value))
  const categories = [...new Set(cssVariableNames.map(categoryFor))]

  const rootBlocks = categories
    .map((category) => {
      const lines = cssVariableNames
        .filter((name) => categoryFor(name) === category)
        .map((name) => cssVarLine(name, 'light'))

      return `  /* ${category} */\n${lines.join('\n')}`
    })
    .join('\n\n')

  return `/* Generated from design/tokens.lib.pen by scripts/sync-design-tokens.ts. */\n/* Do not hand-edit token declarations in this file. */\n\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root,\n[data-theme='light'] {\n${rootBlocks}\n}\n\n[data-theme='dark'] {\n${themedNames.map((name) => cssVarLine(name, 'dark')).join('\n')}\n}\n\n/* responsive-query, responsive-only, and responsive-hide tokens are tracked in tokens.json and must be expanded into media queries by consumers. */\n\nhtml {\n  font-family: var(--font-family-base);\n  color: var(--color-text);\n  background: var(--color-bg-layout);\n}\n\nbody {\n  margin: 0;\n  min-width: var(--responsive-device-min-mobile);\n  font-family: var(--font-family-base);\n  font-size: var(--font-size);\n  line-height: var(--line-height);\n  color: var(--color-text);\n  background: var(--color-bg-layout);\n  -webkit-font-smoothing: antialiased;\n  text-rendering: optimizeLegibility;\n}\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\nbutton,\ninput,\ntextarea,\nselect {\n  font: inherit;\n}\n`
}

function buildTailwindConfig(): string {
  const tailwindTheme = {
    colors: Object.fromEntries(makeColorEntries()),
    spacing: Object.fromEntries(makeTokenEntries(tokenNames.filter((name) => name.startsWith('space-')), 'space-')),
    borderRadius: Object.fromEntries([
      ['DEFAULT', cssVar('radius')],
      ...makeTokenEntries(
        tokenNames.filter((name) => name.startsWith('radius-')),
        'radius-'
      )
    ]),
    fontFamily: {
      sans: [cssVar('font-family-base')],
      heading: [cssVar('font-family-heading')],
      code: [cssVar('font-family-code')],
      mono: [cssVar('font-family-code')]
    },
    fontSize: Object.fromEntries(makeFontSizeEntries()),
    fontWeight: Object.fromEntries(
      makeTokenEntries(
        tokenNames.filter((name) => name.startsWith('font-weight-')),
        'font-weight-'
      )
    ),
    lineHeight: Object.fromEntries([
      ['DEFAULT', cssVar('line-height')],
      ...makeTokenEntries(
        tokenNames.filter((name) => name.startsWith('line-height-')),
        'line-height-'
      )
    ]),
    boxShadow: Object.fromEntries(makeTokenEntries(tokenNames.filter((name) => name.startsWith('shadow-')), 'shadow-')),
    screens: Object.fromEntries(makeScreens()),
    zIndex: Object.fromEntries(makeZIndexEntries()),
    transitionDuration: Object.fromEntries(makeTransitionDurations()),
    transitionTimingFunction: Object.fromEntries(makeTransitionTimingFunctions())
  }

  return `/* Generated from design/tokens.lib.pen by scripts/sync-design-tokens.ts. */\n\nimport type { Config } from 'tailwindcss'\n\nexport default {\n  content: ['./index.html', './src/**/*.{ts,tsx}'],\n  theme: {\n    extend: ${literal(tailwindTheme, 4)}\n  },\n  plugins: []\n} satisfies Config\n`
}

function buildAntdTheme(): string {
  const seedEntries = makeAntdEntries(antdSeedTokenMap)
  const mapEntries = makeAntdEntries(antdMapTokenMap)
  const aliasEntries = makeAntdEntries(antdAliasTokenMap)
  const componentEntries = makeComponentTokenEntries()

  return `/* Generated from design/tokens.lib.pen by scripts/sync-design-tokens.ts. */\n\nimport type { ThemeConfig } from 'antd'\n\nexport const antdSeedToken = ${pascalSafeObjectLiteral(seedEntries, 0)} as const\n\nexport const antdMapToken = ${pascalSafeObjectLiteral(mapEntries, 0)} as const\n\nexport const antdAliasToken = ${pascalSafeObjectLiteral(aliasEntries, 0)} as const\n\nexport const antdComponentToken = ${pascalSafeObjectLiteral(componentEntries, 0)} as const\n\nexport const antdTheme = {\n  token: {\n    ...antdSeedToken,\n    ...antdMapToken,\n    ...antdAliasToken\n  },\n  components: antdComponentToken\n} as unknown as ThemeConfig\n`
}

function buildTokensJson(): string {
  const output = {
    source: 'design/tokens.lib.pen',
    generatedBy: 'scripts/sync-design-tokens.ts',
    summary: {
      total: tokenNames.length,
      cssVariables: tokenNames.filter((name) => !isResponsiveRuntimeOnly(name)).length,
      responsiveRuntimeOnly: tokenNames.filter(isResponsiveRuntimeOnly).length,
      semanticColors: semanticColorNames.length,
      componentTokens: tokenNames.filter((name) => categoryFor(name) === 'Component').length
    },
    tokens: buildRuntimeTokens()
  }

  return `${JSON.stringify(output, null, 2)}\n`
}

function validateReferences(): void {
  const missing = new Set<string>()

  for (const name of tokenNames) {
    const value = variables[name].value
    const primitives = isThemedValue(value) ? value.map((entry) => entry.value) : [value]

    for (const primitive of primitives) {
      if (typeof primitive !== 'string') continue

      for (const match of primitive.matchAll(/\$([a-z0-9-]+)/gi)) {
        if (!hasToken(match[1])) {
          missing.add(`${name} -> ${match[1]}`)
        }
      }
    }
  }

  if (missing.size > 0) {
    throw new Error(`Missing token references:\n${[...missing].join('\n')}`)
  }
}

validateReferences()
mkdirSync(stylesDir, { recursive: true })

writeFileSync(join(stylesDir, 'globals.css'), buildGlobalsCss())
writeFileSync(tailwindConfigPath, buildTailwindConfig())
writeFileSync(join(stylesDir, 'antd-theme.ts'), buildAntdTheme())
writeFileSync(join(stylesDir, 'tokens.json'), buildTokensJson())

console.log(`Synced ${tokenNames.length} tokens from design/tokens.lib.pen`)
