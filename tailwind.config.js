/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Map Tailwind utilities to our CSS variables
                primary: 'var(--color-primary-500)',
                secondary: 'var(--color-text-secondary)',
                'bg-color': 'var(--color-bg)',
                'card-bg': 'var(--color-card)',
            },
        },
    },
    plugins: [],
}
