/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'dark-blue': '#1E4D91',
  			'campus-green': '#2BA56A',
  			'light-blue': '#3498DB',
  			'dark-gray': '#333333',
  			'medium-gray': '#666666',
  			'light-gray': '#E5E5E5',
  			'soft-blue': '#4A90E2',
  			'green-status': '#27AE60',
  			'campus-blue-light': '#2C6FB0',
  			'campus-blue-dark': '#1F4F87',
  			'circle-teal-light': '#4DB9A6',
  			'circle-teal-dark': '#2C8C77',
  			primary: {
  				'50': '#f0f4fd',
  				'100': '#e1e9fb',
  				'200': '#c3d3f7',
  				'300': '#9bb5f1',
  				'400': '#6b8ee8',
  				'500': '#4A90E2',
  				'600': '#3498DB',
  				'700': '#1E4D91',
  				'800': '#1a4080',
  				'900': '#163366',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f9f9f9',
  				'100': '#f5f5f5',
  				'200': '#E5E5E5',
  				'300': '#d4d4d4',
  				'400': '#a3a3a3',
  				'500': '#666666',
  				'600': '#525252',
  				'700': '#404040',
  				'800': '#333333',
  				'900': '#262626',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			success: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#27AE60',
  				'600': '#2BA56A',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
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
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
