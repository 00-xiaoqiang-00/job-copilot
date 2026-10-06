/** Tailwind 预编译配置 (替代运行时 cdn.tailwindcss.com) */
module.exports = {
  darkMode: 'class',
  content: ['./static/index.html', './static/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
    },
  },
  plugins: [],
};
