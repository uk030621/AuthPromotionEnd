/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#EFF1EA',
        ink: '#1F2A24',
        surface: '#FFFFFF',
        brass: '#B08D57',
        safe: '#3F6B54',
        soon: '#B07F2E',
        due: '#B23B30',
        line: '#D9DCD1',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        perforation:
          'repeating-linear-gradient(to bottom, transparent 0 6px, #D9DCD1 6px 8px)',
      },
    },
  },
  plugins: [],
};
