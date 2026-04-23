import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ant: {
          primary: 'var(--ant-color-primary)',
          success: 'var(--ant-color-success)',
          warning: 'var(--ant-color-warning)',
          error: 'var(--ant-color-error)',
          text: 'var(--ant-color-text)',
          textSecondary: 'var(--ant-color-text-secondary)',
          bgBase: 'var(--ant-color-bg-base)',
          bgContainer: 'var(--ant-color-bg-container)',
          border: 'var(--ant-color-border)'
        }
      },
      borderRadius: {
        antSm: 'var(--ant-border-radius-sm)',
        ant: 'var(--ant-border-radius)',
        antLg: 'var(--ant-border-radius-lg)'
      },
      boxShadow: {
        ant: 'var(--ant-box-shadow-secondary)'
      }
    }
  },
  plugins: []
} satisfies Config
