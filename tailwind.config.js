import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      ...require('tailwindcss/defaultTheme').screens,
    },
    extend: {
      screens: {
        'xs': '475px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        brown: {
          DEFAULT: '#3E2723',
          light: '#5D4037',
          hover: '#3F2722', // rgb(63,39,34)
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: {
            DEFAULT: 'hsl(var(--card-foreground))',
          }
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: {
            DEFAULT: 'hsl(var(--popover-foreground))',
          }
        },
        primary: {
          DEFAULT: '#3E2723',
          foreground: {
            DEFAULT: 'hsl(var(--primary-foreground))',
          }
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: {
            DEFAULT: 'hsl(var(--secondary-foreground))',
          }
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: {
            DEFAULT: 'hsl(var(--muted-foreground))',
          }
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: {
            DEFAULT: 'hsl(var(--accent-foreground))',
          }
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: {
            DEFAULT: 'hsl(var(--destructive-foreground))',
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