/* Design Tokens - synced from design/design-system.lib.pen */
/* Last updated: 2026-04-28 */

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        primaryActive: 'var(--color-primary-active)',
        success: 'var(--color-success)',
        successActive: 'var(--color-success-active)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        text: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        textDisabled: 'var(--color-text-disabled)',
        border: 'var(--color-border)',
        borderSecondary: 'var(--color-border-secondary)',
        bgContainer: 'var(--color-bg-container)',
        bgLayout: 'var(--color-bg-layout)',
        fillQuaternary: 'var(--color-fill-quaternary)',
        fillTertiary: 'var(--color-fill-tertiary)',
        fillSecondary: 'var(--color-fill-secondary)',
        transparent: 'var(--color-transparent)',
        transparentWhite: 'var(--color-transparent-white)',
        whiteAlpha85: 'var(--color-white-alpha-85)',
        whiteAlpha12: 'var(--color-white-alpha-12)',
        primaryShadow: 'var(--color-primary-shadow)',
        primaryBg: 'var(--color-primary-bg)',
        primaryBgHover: 'var(--color-primary-bg-hover)',
        primaryBorder: 'var(--color-primary-border)',
        errorBorder: 'var(--color-error-border)',
        errorBg: 'var(--color-error-bg)',
        warningBg: 'var(--color-warning-bg)',
        warningBorder: 'var(--color-warning-border)',
        errorShadow: 'var(--color-error-shadow)',
        warningShadow: 'var(--color-warning-shadow)',
        successBg: 'var(--color-success-bg)',
        successBorder: 'var(--color-success-border)',
        infoBg: 'var(--color-info-bg)',
        infoBorder: 'var(--color-info-border)',
        bgContainerDisabled: 'var(--color-bg-container-disabled)',
        black: 'var(--color-black)',
        borderSubtle: 'var(--color-border-subtle)',
        errorActive: 'var(--color-error-active)',
        errorBgHover: 'var(--color-error-bg-hover)',
        errorHover: 'var(--color-error-hover)',
        primaryBorderHover: 'var(--color-primary-border-hover)',
        white: 'var(--color-white)',
        whiteAlpha65: 'var(--color-white-alpha-65)',
        whiteAlpha40: 'var(--color-white-alpha-40)',
        whiteAlpha25: 'var(--color-white-alpha-25)',
        layoutSiderBg: 'var(--color-layout-sider-bg)',
        layoutSiderBgDark: 'var(--color-layout-sider-bg-dark)'
      },
      spacing: {
        "12": 'var(--space-12)',
        "16": 'var(--space-16)',
        "20": 'var(--space-20)',
        "24": 'var(--space-24)',
        "32": 'var(--space-32)',
        "4": 'var(--space-4)',
        "48": 'var(--space-48)',
        "8": 'var(--space-8)'
      },
      fontFamily: {
        sans: ['var(--font-family-base)'],
        heading: ['var(--font-family-heading)'],
        mono: ['var(--font-family-mono)']
      },
      fontSize: {
        xxs: ['var(--font-size-xxs)', { lineHeight: 'var(--line-height-xs)' }],
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height)' }],
        base: ['var(--font-size)', { lineHeight: 'var(--line-height)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-heading)' }],
        'heading-1': ['var(--font-size-heading-1)', { lineHeight: 'var(--line-height-heading)' }],
        'heading-2': ['var(--font-size-heading-2)', { lineHeight: 'var(--line-height-heading)' }],
        'heading-3': ['var(--font-size-heading-3)', { lineHeight: 'var(--line-height-heading)' }],
        'heading-4': ['var(--font-size-heading-4)', { lineHeight: 'var(--line-height-heading)' }],
        'heading-5': ['var(--font-size-heading-5)', { lineHeight: 'var(--line-height-heading)' }]
      },
      fontWeight: {
        normal: 'var(--font-weight-regular)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)'
      },
      lineHeight: {
        normal: 'var(--line-height)',
        sm: 'var(--line-height-sm)',
        xs: 'var(--line-height-xs)',
        lg: 'var(--line-height-lg)',
        heading: 'var(--line-height-heading)',
        compact: 'var(--line-height-compact)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)'
      }
    }
  },
  plugins: []
} satisfies Config
