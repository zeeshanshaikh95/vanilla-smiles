/**
 * Vanilla Smiles design system.
 *
 * A bright, clinical-luxe palette: vanilla-cream paper, porcelain surfaces, a
 * deep clinical teal and a champagne gold accent. Shape language is soft —
 * generous radii and glassy panels — so the site reads as a calm clinic rather
 * than an editorial fashion house.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paper
        bone: '#FBF7EF', // page ground (vanilla cream)
        ivory: '#FFFDF8', // raised surfaces (porcelain)
        sand: '#EFE6D6',
        clay: '#E1D5C1',
        // Ink
        ink: '#12211F',
        'ink-soft': '#586864',
        'ink-faint': '#93A19D',
        // Mist — the cool neutral used behind glass panels
        mist: '#E8F2EF',
        // Clinical teal
        teal: {
          50: '#EEF7F5',
          100: '#D8EDE9',
          200: '#AEDBD3',
          300: '#7FC5BA',
          400: '#4CA89B',
          500: '#2A8A7C',
          600: '#1A6E63',
          700: '#12554E',
          800: '#0D423D',
          900: '#0A322E',
        },
        // Champagne gold
        gold: {
          100: '#F8F0DA',
          200: '#EFE0B8',
          300: '#E3CB90',
          400: '#D3B268',
          500: '#C09A45',
          600: '#A17C31',
          700: '#7C5E23',
        },
        wine: {
          500: '#7C2B33',
          600: '#63222A',
          700: '#4D1A20',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        micro: '0.24em',
        wide2: '0.12em',
      },
      borderRadius: {
        none: '0',
        xs: '3px',
        sm: '6px',
        DEFAULT: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
        '3xl': '48px',
      },
      boxShadow: {
        lift: '0 22px 48px -30px rgba(10, 50, 46, 0.45)',
        panel: '0 30px 70px -36px rgba(10, 50, 46, 0.40)',
        glass: '0 18px 60px -30px rgba(10, 50, 46, 0.35), inset 0 1px 0 rgba(255,255,255,0.75)',
        soft: '0 10px 30px -18px rgba(10, 50, 46, 0.35)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.07)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -9px, 0) rotate(3deg)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.92)', opacity: '0.7' },
          '70%': { transform: 'scale(1.12)', opacity: '0' },
          '100%': { transform: 'scale(1.12)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-140% 0' },
          '100%': { backgroundPosition: '240% 0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '33%': { transform: 'translate3d(8px, -10px, 0)' },
          '66%': { transform: 'translate3d(-7px, 6px, 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.75s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'slide-in-right': 'slide-in-right 0.32s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'ken-burns': 'ken-burns 10s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'spin-slow': 'spin-slow 26s linear infinite',
        'pulse-ring': 'pulse-ring 3.4s ease-out infinite',
        shimmer: 'shimmer 3.6s linear infinite',
        drift: 'drift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
