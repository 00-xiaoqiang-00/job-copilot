// Offer Comparison & Real Hourly Wage Calculator
const OfferManager = {
  offersData: [],
  radarChart: null,

  async init() {
    await this.loadOffers();
  },

  async loadOffers() {
    try {
      this.offersData = await API.getOfferComparisons();
      this.renderOfferCards();
      this.renderRadarChart();
      lucide.createIcons();
    } catch (e) {
      console.error("加载 Offer 对比数据失败", e);
    }
  },

  renderOfferCards() {
    const container = document.getElementById('offer-cards-list');
    if (!container) return;

    if (this.offersData.length === 0) {
      container.innerHTML = `
        <div class="col-span-full">
          ${UI.empty({
            icon: 'award',
            title: '暂未录入 Offer 记录',
            hint: '收到录取意向后，点击【录入新 Offer】即可一键测算真实时薪与全方位六维雷达对比！',
            action: { text: '+ 录入首个 Offer', onclick: 'OfferManager.openCreateModal()' }
          })}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = this.offersData.map((item, index) => {
      const isTop = index === 0;
      return `
        <div class="bg-white dark:bg-slate-900/90 border ${isTop ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800'} rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all hover:border-slate-700">
          ${isTop ? `
            <div class="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow">
              <i data-lucide="crown" class="w-3 h-3 text-amber-300"></i>
              <span>综合性价比最高</span>
            </div>
          ` : ''}

          <div>
            <!-- Header -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h4 class="font-bold text-base text-slate-900 dark:text-slate-100">${Kanban.escapeHtml(item.company)}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${Kanban.escapeHtml(item.title)}</p>
              </div>
            </div>

            <!-- Core Metric: Real Hourly Wage -->
            <div class="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[11px] font-semibold text-emerald-400 block">🔥 真实税后时薪 (Real Hourly Rate)</span>
                  <span class="text-2xl font-extrabold text-emerald-300 font-mono">¥ ${item.real_hourly_wage} <span class="text-xs text-emerald-400 font-normal">/ 小时</span></span>
                </div>
                <div class="text-right">
                  <span class="text-[11px] text-slate-500 dark:text-slate-400 block">综合量化得分</span>
                  <span class="text-lg font-bold text-amber-400">${item.overall_score} <span class="text-xs text-slate-500">/ 100</span></span>
                </div>
              </div>
            </div>

            <!-- Financial & Work Hours Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs mb-4">
              <div class="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span class="text-slate-500 block text-[10px]">税前年总包 (Total Gross)</span>
                <span class="font-bold text-slate-900 dark:text-slate-200 font-mono">¥ ${(item.total_gross_annual / 10000).toFixed(1)} 万</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span class="text-slate-500 block text-[10px]">预估税后到手 (Net Annual)</span>
                <span class="font-bold text-slate-900 dark:text-slate-200 font-mono">¥ ${(item.estimated_net_annual / 10000).toFixed(1)} 万</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span class="text-slate-500 block text-[10px]">年工作总时长</span>
                <span class="font-bold text-slate-900 dark:text-slate-300 font-mono">${item.annual_work_hours} 小时</span>
              </div>
              <div class="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span class="text-slate-500 block text-[10px]">年通勤耗时折算</span>
                <span class="font-bold text-slate-900 dark:text-slate-300 font-mono">${item.annual_commute_hours} 小时</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <button onclick="OfferManager.openEditModal(${item.id})" class="text-slate-500 dark:text-slate-400 hover:text-blue-400 flex items-center gap-1">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>修改参数</span>
            </button>
            <button onclick="OfferManager.deleteOffer(${item.id})" class="text-rose-400 hover:text-rose-300 p-1">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderRadarChart() {
    const radarCtx = document.getElementById('chart-offer-radar');
    if (!radarCtx) return;

    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null;
    }

    const ctx = radarCtx.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, radarCtx.width, radarCtx.height);
    }

    if (this.offersData.length === 0) return;

    const colors = [
      { border: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
      { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
      { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
    ];

    const datasets = this.offersData.map((item, idx) => {
      const col = colors[idx % colors.length];
      return {
        label: `${item.company} (${item.title})`,
        data: [
          item.radar_scores.salary,
          item.radar_scores.wlb,
          item.radar_scores.growth,
          item.radar_scores.benefits,
          item.radar_scores.commute
        ],
        borderColor: col.border,
        backgroundColor: col.bg,
        borderWidth: 2,
        pointBackgroundColor: col.border
      };
    });

    const isLight = window.Theme && Theme.currentTheme === 'light';

    this.radarChart = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['💰 薪资总包', '⏰ 真实时薪 (WLB)', '🚀 平台与发展', '🎁 福利保障', '🚗 通勤便利'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: isLight ? '#cbd5e1' : '#334155' },
            grid: { color: isLight ? '#e2e8f0' : '#1e293b' },
            pointLabels: {
              color: isLight ? '#334155' : '#94a3b8',
              font: { size: 11, weight: 'bold' }
            },
            ticks: { display: false, min: 0, max: 100 }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: isLight ? '#475569' : '#94a3b8', boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  },

  openCreateModal() {
    const modal = document.getElementById('offer-modal');
    document.getElementById('modal-offer-title').innerText = '录入新 Offer 并测算';
    document.getElementById('offer-form-id').value = '';
    document.getElementById('offer-company').value = '';
    document.getElementById('offer-title').value = '';
    document.getElementById('offer-base-salary').value = '25000';
    document.getElementById('offer-months').value = '15';
    document.getElementById('offer-bonus').value = '0';
    document.getElementById('offer-allowance').value = '1000';
    document.getElementById('offer-hours').value = '8.5';
    document.getElementById('offer-days').value = '5';
    document.getElementById('offer-leave').value = '7';
    document.getElementById('offer-commute').value = '45';
    document.getElementById('offer-benefits').value = '4';
    document.getElementById('offer-growth').value = '4';
    document.getElementById('offer-notes').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  async openEditModal(offerId) {
    try {
      const res = await API.getOffer(offerId);
      const offer = res.offer;

      const modal = document.getElementById('offer-modal');
      document.getElementById('modal-offer-title').innerText = '编辑 Offer 参数';
      document.getElementById('offer-form-id').value = offer.id;
      document.getElementById('offer-company').value = offer.company;
      document.getElementById('offer-title').value = offer.title;
      document.getElementById('offer-base-salary').value = offer.base_salary_monthly;
      document.getElementById('offer-months').value = offer.months_count;
      document.getElementById('offer-bonus').value = offer.year_end_bonus;
      document.getElementById('offer-allowance').value = offer.monthly_allowance;
      document.getElementById('offer-hours').value = offer.work_hours_per_day;
      document.getElementById('offer-days').value = offer.work_days_per_week;
      document.getElementById('offer-leave').value = offer.annual_leave_days;
      document.getElementById('offer-commute').value = offer.commute_minutes_per_day;
      document.getElementById('offer-benefits').value = offer.benefits_score;
      document.getElementById('offer-growth').value = offer.growth_score;
      document.getElementById('offer-notes').value = offer.notes || '';

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      lucide.createIcons();
    } catch (e) {
      App.showToast('加载详情失败: ' + e.message, 'error');
    }
  },

  async handleSaveOffer(e) {
    e.preventDefault();
    const id = document.getElementById('offer-form-id').value;
    const data = {
      company: document.getElementById('offer-company').value.trim(),
      title: document.getElementById('offer-title').value.trim(),
      base_salary_monthly: parseFloat(document.getElementById('offer-base-salary').value) || 0,
      months_count: parseFloat(document.getElementById('offer-months').value) || 12,
      year_end_bonus: parseFloat(document.getElementById('offer-bonus').value) || 0,
      monthly_allowance: parseFloat(document.getElementById('offer-allowance').value) || 0,
      work_hours_per_day: parseFloat(document.getElementById('offer-hours').value) || 8,
      work_days_per_week: parseFloat(document.getElementById('offer-days').value) || 5,
      annual_leave_days: parseInt(document.getElementById('offer-leave').value) || 5,
      commute_minutes_per_day: parseInt(document.getElementById('offer-commute').value) || 30,
      benefits_score: parseInt(document.getElementById('offer-benefits').value) || 4,
      growth_score: parseInt(document.getElementById('offer-growth').value) || 4,
      notes: document.getElementById('offer-notes').value.trim()
    };

    if (!data.company || !data.title) {
      App.showToast('请填写公司名称与岗位名称', 'warning');
      return;
    }

    try {
      if (id) {
        await API.updateOffer(id, data);
        App.showToast('Offer 数据已更新！', 'success');
      } else {
        await API.createOffer(data);
        App.showToast('新 Offer 测算数据已保存！', 'success');
      }
      App.closeModal('offer-modal');
      await this.loadOffers();
    } catch (err) {
      App.showToast('保存失败: ' + err.message, 'error');
    }
  },

  async deleteOffer(id) {
    const ok = await UI.confirm({
      title: '删除 Offer 测算记录',
      message: '确定要删除这条 Offer 测算记录吗？\n删除后五维雷达图与时薪对比将自动重算。',
      danger: true,
      confirmText: '确认删除'
    });
    if (!ok) return;

    try {
      await API.deleteOffer(id);
      App.showToast('Offer 记录已删除', 'success');
      await this.loadOffers();
    } catch (e) {
      App.showToast('删除失败: ' + e.message, 'error');
    }
  }
};
