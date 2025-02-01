import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        brown: {
          DEFAULT: '#3E2723',
          light: '#5D4037',
          dark: '#3E2723'
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
          dark: '#1a1a1a'
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          dark: '#ffffff'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: {
            DEFAULT: 'hsl(var(--card-foreground))',
            dark: '#ffffff'
          }
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: {
            DEFAULT: 'hsl(var(--popover-foreground))',
            dark: '#ffffff'
          }
        },
        primary: {
          DEFAULT: '#3E2723',
          foreground: {
            DEFAULT: 'hsl(var(--primary-foreground))',
            dark: '#ffffff'
          }
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: {
            DEFAULT: 'hsl(var(--secondary-foreground))',
            dark: '#ffffff'
          }
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: {
            DEFAULT: 'hsl(var(--muted-foreground))',
            dark: '#ffffff'
          }
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: {
            DEFAULT: 'hsl(var(--accent-foreground))',
            dark: '#ffffff'
          }
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: {
            DEFAULT: 'hsl(var(--destructive-foreground))',
            dark: '#ffffff'
          }
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}