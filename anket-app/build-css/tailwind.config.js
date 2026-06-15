/** Tailwind config to generate a static CSS bundle for all views (self-hosted, no CDN). */
module.exports = {
  content: ['../views/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Inter', 'sans-serif']
      },
      colors: {
        brand: { 50:'#f0fdf4', 100:'#dcfce7', 500:'#22c55e', 600:'#16a34a', 700:'#15803d', 900:'#14532d' }
      }
    }
  },
  // Safelist patterns for classes built dynamically via Alpine :class bindings
  safelist: [
    { pattern: /^(bg|text|border|from|via|to|ring|fill|stroke)-(emerald|sky|amber|rose|violet|lime|slate|orange|teal|indigo|fuchsia|yellow|green|blue|red)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(grid-cols|col-span)-(1|2|3|4|5|6)$/ },
    'rotate-180', 'grayscale'
  ],
  plugins: []
};
