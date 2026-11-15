/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VIAROU palette (brief p.2): warm white ground, sand for product display,
        // sage for selected states, deep green for text and primary actions.
        paper: '#F8F5EF',
        sand: { DEFAULT: '#E6DAC6', deep: '#CDBB9E' },
        sage: { DEFAULT: '#A9B8A0', soft: '#DFE6D9' },
        forest: { DEFAULT: '#1F3A2E', soft: '#4F6358', hover: '#2C4D3E' },
        alert: '#9E3A25',
        // legacy tokens still used by admin/contact pages
        'jack-black': '#1F3A2E',
        'jack-gray': '#2C4D3E',
        'jack-light': '#E6DAC6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
