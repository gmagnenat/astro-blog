/** @type {import('tailwindcss').Config} */
import fluid, { extract, screens, fontSize } from 'fluid-tailwind'
export default {
	content: {
		files: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
		extract,
	},
	theme: {
		screens,
		fontSize,
		extend: {
			colors: {
				'gm-blue': '#0099FF',
				'gm-dark': '#202020'
			}
		},
	},
	plugins: [
		fluid
	],
}
