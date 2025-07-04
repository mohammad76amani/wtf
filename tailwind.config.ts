import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxurious primary colors
        primary: {
          DEFAULT: '#D8A1B1', // Rose quartz - elegant pink
          light: '#F3D7E0',
          dark: '#B6798A',
        },
        secondary: {
          DEFAULT: '#8A9EA7', // Dusty blue - sophisticated
          light: '#C5D1D7',
          dark: '#5F7A87',
        },
        // Accent colors
        accent: {
          gold: {
            DEFAULT: '#D4AF37', // Luxury gold
            light: '#F0E6C0',
            dark: '#B08C1A',
          },
          lavender: {
            DEFAULT: '#967BB6', // Soft lavender
            light: '#D7CEE4',
            dark: '#6A5187',
          },
          emerald: {
            DEFAULT: '#50C878', // Rich emerald
            light: '#A8E6C0',
            dark: '#2E8B57',
          },
        },
        // Neutral palette
        neutral: {
          cream: '#F8F4E3',
          champagne: '#F7E7CE',
          pearl: '#EAEAEA',
          taupe: '#B2A59B',
          charcoal: '#3A3A3A',
        },
        // Background colors
        background: {
          light: '#FDF9F7', // Soft cream
          DEFAULT: '#F5EFE7', // Warm ivory
          dark: '#E8DFD8', // Soft beige
        },
        // Text colors
        text: {
          DEFAULT: '#4A4A4A', // Soft black
          light: '#6E6E6E', // Medium gray
          muted: '#9B9B9B', // Light gray
        },
        // Status colors
        status: {
          success: '#78A77E', // Soft green
          warning: '#E6B655', // Soft amber
          error: '#D67F7F', // Soft red
          info: '#7FABD8', // Soft blue
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(216, 161, 177, 0.3)',
        'gold': '0 0 10px rgba(212, 175, 55, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'marble': 'url("/images/marble-texture.jpg")',
      },
    },
  },
  plugins: [],
}

export default config
