// Theme Management (Dark / Light Mode)
const Theme = {
  currentTheme: 'light',

  init() {
    const forced = new URLSearchParams(location.search).get('theme');
    const saved = (forced === 'dark' || forced === 'light') ? forced : localStorage.getItem('job_copilot_theme');
    if (saved) {
      this.setTheme(saved);
    } else {
      // 默认使用清爽高对比度的白色浅色背景
      this.setTheme('light');
    }
  },


  toggle() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  },

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('job_copilot_theme', theme);

    const html = document.documentElement;
    const btn = document.getElementById('theme-toggle-btn');

    if (theme === 'dark') {
      html.classList.add('dark');
      if (btn) {
        btn.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>`;
      }
    } else {
      html.classList.remove('dark');
      if (btn) {
        btn.innerHTML = `<i data-lucide="moon" class="w-4 h-4 text-slate-600"></i>`;
      }
    }

    lucide.createIcons();

    // 重新渲染图表适配新主题文字颜色 (卫语句保护，避免时序未初始化报错)
    if (window.Analytics && typeof Analytics.renderCharts === 'function' && window.App && App.currentView === 'analytics') {
      Analytics.renderCharts();
    }
    if (window.OfferManager && typeof OfferManager.renderRadarChart === 'function' && window.App && App.currentView === 'offers') {
      OfferManager.renderRadarChart();
    }
  }
};
