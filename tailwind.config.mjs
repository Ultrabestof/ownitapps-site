import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        gold: {
          DEFAULT: '#C9A84C',
          hover: '#B8932E',
          dim: 'rgba(201,168,76,0.15)',
        },
        // Sidebar
        sidebar: {
          bg: '#2B2B2B',
          text: '#E8DDD0',
          muted: '#9A8F82',
          border: '#3A3A3A',
        },
        // Surface
        main: '#F5F0E8',
        card: '#FFFFFF',
        surface2: '#F0EBE0',
        surface3: '#E8E0D0',
        // Text
        primary: '#2B2B2B',
        secondary: '#6B6258',
        muted: '#9A8F82',
        // Status
        brand: {
          green: '#2E8B5A',
          red: '#C0392B',
          blue: '#2471A3',
          amber: '#C9A84C',
        },
      },
      fontFamily: {
        heading: ['Syne', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-sm': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        s1: '4px',
        s2: '8px',
        s3: '12px',
        s4: '16px',
        s5: '24px',
        s6: '32px',
        s7: '48px',
      },
      borderRadius: {
        card: '10px',
        input: '6px',
        pill: '20px',
      },
      maxWidth: {
        content: '72rem',
        prose: '68ch',
        hero: '60rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.08)',
        gold: '0 4px 20px rgba(201,168,76,0.25)',
        dropdown: '0 8px 30px rgba(0,0,0,0.12)',
        modal: '0 24px 80px rgba(0,0,0,0.2)',
      },
      zIndex: {
        sidebar: '100',
        'mobile-nav': '200',
        dropdown: '300',
        modal: '500',
        toast: '700',
        save: '800',
      },
      typography: {
        ownitapps: {
          css: {
            '--tw-prose-body': '#2B2B2B',
            '--tw-prose-headings': '#2B2B2B',
            '--tw-prose-lead': '#6B6258',
            '--tw-prose-links': '#C9A84C',
            '--tw-prose-bold': '#2B2B2B',
            '--tw-prose-counters': '#9A8F82',
            '--tw-prose-bullets': '#C9A84C',
            '--tw-prose-hr': 'rgba(0,0,0,0.07)',
            '--tw-prose-quotes': '#2B2B2B',
            '--tw-prose-quote-borders': '#C9A84C',
            '--tw-prose-captions': '#9A8F82',
            '--tw-prose-code': '#2B2B2B',
            '--tw-prose-pre-code': '#E8DDD0',
            '--tw-prose-pre-bg': '#2B2B2B',
            '--tw-prose-th-borders': 'rgba(0,0,0,0.12)',
            '--tw-prose-td-borders': 'rgba(0,0,0,0.07)',
            maxWidth: '72ch',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            h1: { fontFamily: '"Syne", system-ui, sans-serif', fontWeight: '800', letterSpacing: '-0.03em' },
            h2: { fontFamily: '"Syne", system-ui, sans-serif', fontWeight: '700', letterSpacing: '-0.025em' },
            h3: { fontFamily: '"Syne", system-ui, sans-serif', fontWeight: '700', letterSpacing: '-0.02em' },
            a: { color: '#C9A84C', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.3)', transition: 'border-color 0.2s' },
            'a:hover': { borderBottomColor: '#C9A84C' },
            code: { fontFamily: '"DM Mono", monospace', fontSize: '0.9em', backgroundColor: '#F0EBE0', padding: '0.1em 0.3em', borderRadius: '4px' },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-up-slow': 'fadeUp 0.7s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'slide-in-left': 'slideInLeft 0.4s ease-out both',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(201,168,76,0)' } },
      },
    },
  },
  plugins: [typography],
};
