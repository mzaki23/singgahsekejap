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
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        'accent-yellow': '#FFE66D',
        'accent-green': '#95E1D3',
        'accent-pink': '#FFB6C1',
        'accent-orange': '#FFA07A',
        'text-dark': '#2C3E50',
        'sky-blue': '#87CEEB',
        'y2k-blue': '#6B9CFF',
        'y2k-blue-light': '#8EB3FF',
        'y2k-green': '#BEEA9A',
        'y2k-green-dark': '#88C949',
        'y2k-yellow': '#FFF176',
        'y2k-pink': '#FFB3D9',
        'y2k-window': '#E8F1FF'
      },
      fontFamily: {
        display: ['Bangers', 'cursive'],
        handwritten: ['Permanent Marker', 'cursive'],
        cute: ['Fredoka', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        elegant: ['Playfair Display', 'serif'],
        pixel: ['DotGothic16', 'sans-serif'],
        serif: ['Libre Baskerville', 'serif']
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite'
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.7' }
        }
      }
    },
  },
  plugins: [],
}
