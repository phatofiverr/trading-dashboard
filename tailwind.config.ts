
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1920px'
			}
		},
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
		},
		extend: {
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				sidebar: {
					DEFAULT: 'var(--sidebar)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				},
				positive: {
					DEFAULT: '#15b9a6', // Updated from #00DD99 to #15b9a6
					foreground: '#ECFEFF',
					muted: '#15b9a6' // Updated from #00C088 to #15b9a6
				},
				negative: {
					DEFAULT: '#D12B35',
					foreground: '#FFF1F2',
					muted: '#B01F29'
				},
				warning: {
					DEFAULT: '#F59E0B',
					foreground: '#FFFBEB',
					muted: '#D97706'
				},
				info: {
					DEFAULT: '#3B82F6',
					foreground: '#EFF6FF',
					muted: '#2563EB'
				},
				trading: {
					bg: '#0f0f0f',     // Darker background
					panel: '#1a1a1a',   // Panel background
					border: '#333333',  // Border color
					accent1: '#555555', // Changed from purple to gray
					accent2: '#777777', // Changed from magenta to gray
					accent3: '#444444', // Changed from blue to gray
					accent4: '#333333', // Changed from orange to gray
					muted: '#666666'    // Muted text
				},
				social: {
					primary: '#15b9a6',  // Updated from #00DD99 to #15b9a6
					secondary: '#3B82F6', // Blue for interaction elements
					accent: '#8B5CF6',    // Purple for highlights
					muted: '#64748B',     // Subtle text/icons
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				'slide-in': {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(0)" }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
