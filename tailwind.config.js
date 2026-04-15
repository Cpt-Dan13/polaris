/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        accent: '#e94560',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        gold: '#c8972b',
        goldLight: '#f0c05a',
        textSecondary: '#666666',
        textLight: '#999999',
        borderColor: '#e0e0e0',
        cardLight: '#ffffff',
        cardDark: '#16213e',
        bgLight: '#f8f4f0',
        bgDark: '#1a1a2e',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
