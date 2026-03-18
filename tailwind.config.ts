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
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				montserrat: ['"Montserrat"', 'system-ui', 'sans-serif'],
				'open-sans': ['"Open Sans"', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(var(--primary-50))',
					100: 'hsl(var(--primary-100))',
					200: 'hsl(var(--primary-200))',
					300: 'hsl(var(--primary-300))',
					400: 'hsl(var(--primary-400))',
					500: 'hsl(var(--primary-500))',
					600: 'hsl(var(--primary-600))',
					700: 'hsl(var(--primary-700))',
					800: 'hsl(var(--primary-800))',
					900: 'hsl(var(--primary-900))',
					950: 'hsl(var(--primary-950))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Vizzu blue scale
				vizzu: {
					50: 'hsl(var(--blue-50))',
					100: 'hsl(var(--blue-100))',
					200: 'hsl(var(--blue-200))',
					300: 'hsl(var(--blue-300))',
					400: 'hsl(var(--blue-400))',
					500: 'hsl(var(--blue-500))',
					600: 'hsl(var(--blue-600))',
					700: 'hsl(var(--blue-700))',
					800: 'hsl(var(--blue-800))',
					900: 'hsl(var(--blue-900))',
				},
				// Status
				success: {
					DEFAULT: 'hsl(var(--success))',
					light: 'rgba(22, 163, 74, 0.10)',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					light: 'rgba(217, 119, 6, 0.10)',
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					light: 'rgba(13, 148, 136, 0.10)',
				},
				danger: {
					DEFAULT: 'hsl(var(--destructive))',
					light: 'rgba(220, 38, 38, 0.08)',
				},
				glass: {
					white: 'rgba(255, 255, 255, 0.1)',
					black: 'rgba(0, 0, 0, 0.1)',
					primary: 'rgba(var(--primary-rgb), 0.1)',
					secondary: 'rgba(var(--secondary-rgb), 0.1)'
				},
				gradient: {
					from: 'hsl(var(--gradient-from))',
					via: 'hsl(var(--gradient-via))',
					to: 'hsl(var(--gradient-to))'
				},
				clean: {
					black: 'hsl(var(--clean-black))',
					white: 'hsl(var(--clean-white))',
					gray: {
						50: 'hsl(var(--clean-gray-50))',
						100: 'hsl(var(--clean-gray-100))',
						200: 'hsl(var(--clean-gray-200))',
						300: 'hsl(var(--clean-gray-300))',
						400: 'hsl(var(--clean-gray-400))',
						500: 'hsl(var(--clean-gray-500))'
					}
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fadeUp': {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fadeIn': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slideUp': {
					from: { opacity: '0', transform: 'translateY(40px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scaleIn': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-status': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.5', transform: 'scale(1.4)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fadeUp 0.45s ease both',
				'fade-up-delay-1': 'fadeUp 0.45s 0.08s ease both',
				'fade-up-delay-2': 'fadeUp 0.45s 0.16s ease both',
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.6s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'pulse-status': 'pulse-status 2s ease-in-out infinite',
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-vizzu': 'linear-gradient(135deg, hsl(213, 69%, 43%) 0%, hsl(213, 62%, 54%) 100%)',
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'subtle': 'var(--shadow-subtle)',
				'card': 'var(--shadow-card)',
				'modern': 'var(--shadow-modern)',
				'btn': 'var(--shadow-btn)',
				'topbar': 'var(--shadow-topbar)',
				'glow': '0 0 20px rgba(34, 96, 184, 0.3)',
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
