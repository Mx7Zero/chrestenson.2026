/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAFAFA',
        'bg-surface': '#FFFFFF',
        'bg-elevated': '#F5F5F7',
        'border': '#E5E5E5',
        'text-primary': '#1D1D1F',
        'text-secondary': '#6E6E73',
        'text-muted': '#86868B',
        'accent': '#0071E3',
        'accent-hover': '#0077ED',
        'success': '#34C759',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
