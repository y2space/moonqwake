/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./src/**/*.{svelte,ts,html}"
	],
	theme: {
		extend: {},
	},
	plugins: [
		require('daisyui'),
	],
}
