/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./js/*.js"],
    theme: {
        extend: {
            colors: {
                brand: { DEFAULT: '#216825', dark: '#1b5e20', soft: '#f1f8f1' },
                sun: { DEFAULT: '#fbc02d', soft: '#fff9e6' },
                background: '#fcfdfc',
                foreground: '#1a241a',
                border: '#e4e9e4',
                muted: { DEFAULT: '#f5f7f5', foreground: '#6b7a6b' },
                card: '#ffffff',
                secondary: '#f1f8f1',
            },
            fontFamily: {
                display: ['Plus Jakarta Sans', 'sans-serif'],
                sans: ['Inter', 'sans-serif']
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0,0,0,0.05)',
                'lift': '0 20px 40px -4px rgba(0,0,0,0.1)'
            }
        },
    },
    plugins: [],
}
