// Campus Recruitment Radar (全网秋招情报站控制器)
const CampusRadar = {
  filters: {
    industry: 'all',
    recruitment_type: 'all',
    target_graduates: 'all',
    status: 'all',
    keyword: ''
  },
  recruits: [],
  stats: {},

  init() {
    this.setupEventListeners();
    this.renderSearchHistory();
    this.loadData();
  },

  setupEventListeners() {
    const searchInput = document.getElementById('campus-search-input');
    const searchBtn = document.getElementById('btn-campus-search');
    const syncBtn = document.getElementById('btn-campus-sync');
    const parseModalBtn = document.getElementById('btn-open-parse-modal');

    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.filters.keyword = searchInput.value.trim();
          if (this.filters.keyword) this.saveSearchHistory(this.filters.keyword);
          this.loadData();
        }
      });
      searchInput.addEventListener('input', (e) => {
        if (!e.target.value.trim() && this.filters.keyword) {
          this.filters.keyword = '';
          this.loadData();
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        if (searchInput) {
          this.filters.keyword = searchInput.value.trim();
          if (this.filters.keyword) this.saveSearchHistory(this.filters.keyword);
        }
        this.loadData();
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.syncAll());
    }

    if (parseModalBtn) {
      parseModalBtn.addEventListener('click', () => this.openParseModal());
    }

    const sortFilter = document.getElementById('campus-sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => this.renderCards());
    }
  },

  async loadData() {
    const container = document.getElementById('campus-recruits-grid');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
          <div class="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-sm font-semibold text-slate-200">正在聚合加载全网秋招/提前批最新企业动态...</p>
          <p class="text-xs text-slate-500 mt-1">覆盖 医疗医药、互联网大厂、智能制造、央国企与金融科技</p>
        </div>
      `;
    }

    try {
      const [recruits, stats] = await Promise.all([
        API.getCampusRecruits(this.filters),
        API.getCampusStats()
      ]);
      this.recruits = recruits;
      this.stats = stats;

      this.renderStats();
      this.renderCards();
    } catch (e) {
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-rose-400 text-xs font-semibold">加载秋招情报失败: ${e.message}</div>`;
      }
    }
  },

  viewMode: 'grouped', // 'grouped' | 'flat'
  collapsedGroups: {},

  renderStats() {
    const s = this.stats;
    const totalEl = document.getElementById('stat-campus-total');
    const endingEl = document.getElementById('stat-campus-ending');
    const medicalEl = document.getElementById('stat-campus-medical');
    const techEl = document.getElementById('stat-campus-tech');

    if (totalEl) totalEl.innerText = s.total_companies || this.recruits.length || 0;
    if (endingEl) endingEl.innerText = s.ending_soon_count || 0;
    if (medicalEl) medicalEl.innerText = s.medical_count || 0;
    if (techEl) techEl.innerText = s.tech_count || 0;

    // 动态同步分类大标签数量 Badge
    const countAll = document.getElementById('tab-count-all');
    const countTech = document.getElementById('tab-count-tech');
    const countMfg = document.getElementById('tab-count-mfg');
    const countMed = document.getElementById('tab-count-medical');
    const countState = document.getElementById('tab-count-state');
    const countFin = document.getElementById('tab-count-finance');
    const countConsumer = document.getElementById('tab-count-consumer');

    if (countAll) countAll.innerText = s.total_companies || 0;
    if (countTech) countTech.innerText = s.tech_count || 0;
    if (countMfg) countMfg.innerText = s.manufacturing_count || 0;
    if (countMed) countMed.innerText = s.medical_count || 0;
    if (countState) countState.innerText = s.state_owned_count || 0;
    if (countFin) countFin.innerText = s.finance_count || 0;
    if (countConsumer) countConsumer.innerText = s.consumer_count || 0;

    // 动态同步全网自动更新状态与时间戳
    const syncTimeEl = document.getElementById('campus-last-sync-text');
    const syncStatusLabel = document.getElementById('campus-sync-status-label');
    if (syncTimeEl && s.last_sync_time) {
      syncTimeEl.innerText = `· 上次同步: ${s.last_sync_time}`;
    }
    if (syncStatusLabel) {
      syncStatusLabel.innerText = '全网自动同步开启中';
    }
  },

  setQuickSearch(keyword) {
    const searchInput = document.getElementById('campus-search-input');
    if (searchInput) {
      searchInput.value = keyword;
      this.filters.keyword = keyword;
    }
    this.saveSearchHistory(keyword);
    this.loadData();
  },

  saveSearchHistory(keyword) {
    if (!keyword || !keyword.trim()) return;
    const cleanKw = keyword.trim();
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('campus_search_history') || '[]');
    } catch (e) {
      history = [];
    }
    history = history.filter(item => item !== cleanKw);
    history.unshift(cleanKw);
    if (history.length > 6) history = history.slice(0, 6);
    try {
      localStorage.setItem('campus_search_history', JSON.stringify(history));
    } catch (e) {}
    this.renderSearchHistory();
  },

  renderSearchHistory() {
    const container = document.getElementById('campus-history-container');
    const chipsEl = document.getElementById('campus-history-chips');
    if (!container || !chipsEl) return;

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('campus_search_history') || '[]');
    } catch (e) {
      history = [];
    }

    if (!history || history.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    chipsEl.innerHTML = history.map(kw => `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors" onclick="CampusRadar.setQuickSearch('${this.escapeHtml(kw)}')">
        <span>${this.escapeHtml(kw)}</span>
      </span>
    `).join('');
    if (window.lucide) lucide.createIcons();
  },

  clearSearchHistory() {
    try {
      localStorage.removeItem('campus_search_history');
    } catch (e) {}
    this.renderSearchHistory();
  },

  setViewMode(mode) {
    this.viewMode = mode;
    const btnGrouped = document.getElementById('btn-view-mode-grouped');
    const btnFlat = document.getElementById('btn-view-mode-flat');

    if (btnGrouped && btnFlat) {
      if (mode === 'grouped') {
        btnGrouped.className = 'px-2 py-0.5 rounded-md font-medium transition-all bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs flex items-center gap-1';
        btnFlat.className = 'px-2 py-0.5 rounded-md font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1';
      } else {
        btnFlat.className = 'px-2 py-0.5 rounded-md font-medium transition-all bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs flex items-center gap-1';
        btnGrouped.className = 'px-2 py-0.5 rounded-md font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1';
      }
    }
    this.renderCards();
  },

  toggleGroup(groupKey) {
    this.collapsedGroups[groupKey] = !this.collapsedGroups[groupKey];
    const sectionEl = document.getElementById(`campus-group-content-${groupKey}`);
    const iconEl = document.getElementById(`campus-group-icon-${groupKey}`);
    const labelEl = document.getElementById(`campus-group-label-${groupKey}`);
    if (sectionEl) {
      if (this.collapsedGroups[groupKey]) {
        sectionEl.classList.add('hidden');
        if (iconEl) iconEl.style.transform = 'rotate(-90deg)';
        if (labelEl) labelEl.innerText = '展开';
      } else {
        sectionEl.classList.remove('hidden');
        if (iconEl) iconEl.style.transform = 'rotate(0deg)';
        if (labelEl) labelEl.innerText = '收起';
      }
    }
  },

  setIndustryFilter(ind) {
    this.filters.industry = ind;
    document.querySelectorAll('.campus-ind-btn').forEach(btn => {
      if (btn.getAttribute('data-ind') === ind) {
        btn.className = 'campus-ind-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 flex items-center gap-1.5';
      } else {
        btn.className = 'campus-ind-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5';
      }
    });
    this.loadData();
  },

  setTypeFilter(type) {
    this.filters.recruitment_type = type;
    document.querySelectorAll('.campus-type-btn').forEach(btn => {
      if (btn.getAttribute('data-type') === type) {
        btn.className = 'campus-type-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium';
      } else {
        btn.className = 'campus-type-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
      }
    });
    this.loadData();
  },

  setGradYearFilter(year) {
    this.filters.target_graduates = year;
    document.querySelectorAll('.campus-grad-btn').forEach(btn => {
      if (btn.getAttribute('data-grad') === year) {
        btn.className = 'campus-grad-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium';
      } else {
        btn.className = 'campus-grad-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
      }
    });
    this.loadData();
  },

  setStatusFilter(st) {
    this.filters.status = st;
    document.querySelectorAll('.campus-status-btn').forEach(btn => {
      if (btn.getAttribute('data-status') === st) {
        btn.className = 'campus-status-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium';
      } else {
        btn.className = 'campus-status-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
      }
    });
    this.loadData();
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  parseRoles(rolesSummary) {
    if (!rolesSummary) return [];
    let clean = rolesSummary.replace(/\([^\)]*地点[^\)]*\)/g, '').replace(/（[^）]*地点[^）]*）/g, '');
    let parts = clean.split(/[、,;；\n]+/);
    let results = [];
    for (let p of parts) {
      p = p.trim();
      if (p && p.length >= 2 && p.length <= 28 && !p.includes('地点') && !p.includes('面向') && !p.includes('全国')) {
        results.push(p);
      }
    }
    return results;
  },

  renderCardHtml(item, index) {
    const isEnding = item.status === 'ending';
    const isMedical = (item.industry || '').includes('医疗') || (item.industry || '').includes('生物') || (item.industry || '').includes('药');
    const isTech = (item.industry || '').includes('互联网') || (item.industry || '').includes('IT');
    const isState = (item.industry || '').includes('国企') || (item.industry || '').includes('央企') || (item.industry || '').includes('科研');
    const isMfg = (item.industry || '').includes('制造') || (item.industry || '').includes('汽车') || (item.industry || '').includes('芯片');
    const isFin = (item.industry || '').includes('金融') || (item.industry || '').includes('银行') || (item.industry || '').includes('证券');

    let indBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (isMedical) indBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
    else if (isTech) indBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
    else if (isMfg) indBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
    else if (isState) indBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
    else if (isFin) indBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';

    const isEarly = (item.recruitment_type || '').includes('提前批');
    const typeBadgeColor = isEarly
      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';

    const parsedRoles = this.parseRoles(item.roles_summary);

    return `
      <div class="bg-white dark:bg-slate-900/80 border ${isEnding ? 'border-amber-400 dark:border-amber-500/60 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'} rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden group">
        
        ${isEnding ? `
          <div class="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-rose-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg shadow flex items-center gap-1">
            <i data-lucide="flame" class="w-3 h-3"></i>
            <span>即将截止</span>
          </div>
        ` : ''}

        <div>
          <!-- Company & Badges -->
          <div class="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" onclick="CampusRadar.previewAnnouncement(${index})">
                  ${this.escapeHtml(item.company_name)}
                </h3>
                <button type="button" data-company="${this.escapeHtml(item.company_name)}" onclick="event.stopPropagation(); CompanyManager.openProfileModal(this.dataset.company)" class="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-colors" title="一键企业背调与职场口碑">
                  <i data-lucide="building-2" class="w-3 h-3"></i>
                  <span>查企业</span>
                </button>
                <button type="button" data-company="${this.escapeHtml(item.company_name)}" onclick="event.stopPropagation(); CampusRadar.openCompanyAllPositionsModal(this.dataset.company)" class="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-500/20 transition-colors" title="全量在招岗位透视与多通道网申">
                  <i data-lucide="layers" class="w-3 h-3"></i>
                  <span>全量岗位</span>
                </button>
              </div>
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border ${indBadgeColor}">
                  ${this.escapeHtml(item.industry)}
                </span>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeBadgeColor}">
                  ${this.escapeHtml(item.recruitment_type)}
                </span>
                <span class="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                  🎓 ${this.escapeHtml(item.target_graduates)}
                </span>
              </div>
            </div>
          </div>

          <!-- Roles Summary & Clickable Badges -->
          <div class="my-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">🎯 招募方向与细分在招岗位：</span>
              ${parsedRoles.length > 0 ? `<span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">点岗位直转看板</span>` : ''}
            </div>
            ${parsedRoles.length > 0 ? `
              <div class="flex flex-wrap gap-1.5 pt-0.5">
                ${parsedRoles.map(r => `
                  <button type="button" onclick="event.stopPropagation(); CampusRadar.importSpecificRole(${item.id}, '${this.escapeHtml(r)}')" class="inline-flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700 px-2 py-0.5 rounded-lg transition-all shadow-2xs hover:shadow-xs group/btn cursor-pointer" title="点击直接将「${this.escapeHtml(r)}」导入待投递看板">
                    <span>${this.escapeHtml(r)}</span>
                    <span class="text-[9px] text-indigo-400 dark:text-indigo-500 group-hover/btn:text-indigo-600 font-normal">+导入</span>
                  </button>
                `).join('')}
              </div>
            ` : `
              <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                ${this.escapeHtml(item.roles_summary || '研发、管培生、职能类等多岗位开放')}
              </p>
            `}
          </div>

          <!-- Referral Code & Deadline -->
          <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            ${item.referral_code ? `
              <div class="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1.5 rounded-lg">
                <span class="text-indigo-700 dark:text-indigo-300 font-mono text-xs">🔑 内推码: <strong class="text-indigo-900 dark:text-white select-all font-bold">${this.escapeHtml(item.referral_code)}</strong></span>
                <button data-code="${this.escapeHtml(item.referral_code)}" onclick="CampusRadar.copyReferralCode(this.dataset.code)" class="text-[11px] text-indigo-700 dark:text-indigo-300 hover:text-white hover:bg-indigo-600 bg-indigo-100 dark:bg-indigo-600/40 px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-medium">
                  <i data-lucide="copy" class="w-3 h-3"></i>
                  <span>复制</span>
                </button>
              </div>
            ` : ''}

            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span class="flex items-center gap-1">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>网申截止: ${item.deadline ? `<strong class="${isEnding ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-slate-700 dark:text-slate-300 font-mono'}">${item.deadline}</strong>` : '招满即止 / 详见官网'}</span>
              </span>
              <span class="text-[10px] text-slate-400">来源: ${this.escapeHtml(item.source || '校招官方')}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
          <div class="flex items-center gap-2">
            ${item.apply_url ? `
              <a href="${item.apply_url}" target="_blank" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                <span>直达网申</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
            ` : ''}
            <button onclick="CampusRadar.previewAnnouncement(${index})" class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span>通告详情</span>
            </button>
            <button onclick="CampusRadar.openCompanyAllPositionsModal('${this.escapeHtml(item.company_name)}')" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex items-center gap-1 font-semibold" title="透视该企业全部专场与在招岗位">
              <i data-lucide="layers" class="w-3.5 h-3.5"></i>
              <span>全量岗位</span>
            </button>
          </div>

          <button onclick="CampusRadar.importToJob(${item.id})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>转入待投看板</span>
          </button>
        </div>

      </div>
    `;
  },

  resetFilters() {
    this.filters = {
      industry: 'all',
      recruitment_type: 'all',
      target_graduates: 'all',
      status: 'all',
      keyword: ''
    };
    const searchInput = document.getElementById('campus-search-input');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.campus-ind-btn').forEach(btn => {
      if (btn.getAttribute('data-ind') === 'all') {
        btn.className = 'campus-ind-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 flex items-center gap-1.5';
      } else {
        btn.className = 'campus-ind-btn px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5';
      }
    });
    document.querySelectorAll('.campus-type-btn').forEach(btn => {
      btn.className = btn.getAttribute('data-type') === 'all'
        ? 'campus-type-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium'
        : 'campus-type-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
    });
    document.querySelectorAll('.campus-grad-btn').forEach(btn => {
      btn.className = btn.getAttribute('data-grad') === 'all'
        ? 'campus-grad-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium'
        : 'campus-grad-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
    });
    document.querySelectorAll('.campus-status-btn').forEach(btn => {
      btn.className = btn.getAttribute('data-status') === 'all'
        ? 'campus-status-btn px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-medium'
        : 'campus-status-btn px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60';
    });

    this.loadData();
  },

  currentLiveResults: [],

  async triggerLiveSearch(kwOverride = null) {
    const input = document.getElementById('campus-search-input');
    const kw = kwOverride !== null ? kwOverride : (input ? input.value.trim() : '');
    if (!kw) {
      App.showToast("请输入要全网检索的企业名称或招募方向", "warning");
      return;
    }

    const container = document.getElementById('campus-recruits-grid');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div class="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1"></div>
          <p class="text-sm font-semibold text-slate-200">正在全网实时动态检索「${this.escapeHtml(kw)}」最新校招简章与高校就业网通告...</p>
          <p class="text-xs text-slate-500">穿透清华、交大等高校就业网、企业招聘门户及各渠道公开公告</p>
        </div>
      `;
    }

    try {
      const data = await API.liveSearchCampus(kw);
      if (data && data.results && data.results.length > 0) {
        this.renderLiveCards(kw, data.results);
      } else {
        App.showToast(`全网未检索到「${kw}」专属校招通告，为您呈现企业全景背调`, "info");
        this.filters.keyword = kw;
        this.recruits = [];
        this.renderCards();
      }
    } catch (e) {
      App.showToast("全网检索异常: " + e.message, "error");
      this.filters.keyword = kw;
      this.loadData();
    }
  },

  renderLiveCards(kw, results) {
    const container = document.getElementById('campus-recruits-grid');
    if (!container) return;

    this.currentLiveResults = results;

    container.innerHTML = `
      <div class="col-span-full space-y-4">
        <div class="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <i data-lucide="globe" class="w-4 h-4 text-indigo-500"></i>
                <span>全网实时检索发现：关于「${this.escapeHtml(kw)}」的最新校园招聘与高校通告 (${results.length}条)</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">数据实时抓取自高校就业网与企业公开网申入口，您可一键收录进本地情报站或直接投递看板</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button data-company="${this.escapeHtml(kw)}" onclick="CompanyManager.openCompanyModal(this.dataset.company)" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all">
              <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
              <span>企业全景背调</span>
            </button>
            <button onclick="CampusRadar.resetFilters()" class="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <span>清空搜索</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${results.map((item, idx) => `
            <div class="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <i data-lucide="globe" class="w-3 h-3"></i>
                    <span>实时网络发现</span>
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">${this.escapeHtml(item.recruitment_type)}</span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  ${this.escapeHtml(item.display_title || item.company_name)}
                </h4>
                <div class="mt-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <p class="font-medium text-slate-700 dark:text-slate-200 line-clamp-1"><span class="text-slate-400 font-normal">岗位方向：</span>${this.escapeHtml(item.roles_summary)}</p>
                  <p class="text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed text-[11px]"><span class="text-slate-400 font-normal">简章摘要：</span>${this.escapeHtml(item.announcement_text)}</p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                ${item.apply_url ? `
                  <a href="${item.apply_url}" target="_blank" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                    <span>直达公告/网申</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  </a>
                ` : '<span></span>'}
                <button onclick="CampusRadar.importLiveByIndex(${idx})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                  <span>一键收录进情报站</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    lucide.createIcons();
  },

  renderCompanyDiscoverySection(kw, matchedItems) {
    const allRoles = [];
    const seenRoles = new Set();
    for (const it of matchedItems) {
      const roles = this.parseRoles(it.roles_summary);
      for (const r of roles) {
        if (!seenRoles.has(r)) {
          seenRoles.add(r);
          allRoles.push({ role: r, recruitId: it.id, comp: it.company_name, type: it.recruitment_type });
        }
      }
    }

    const encodedKw = encodeURIComponent(kw);
    const isPharma = matchedItems.some(it => (it.industry || '').includes('药') || (it.industry || '').includes('医疗') || (it.industry || '').includes('生物')) || /药|医疗|生物|艾昆纬|IQVIA|泰格|百济|阿斯利康/i.test(kw);

    const gateways = [
      {
        title: '企业官方校招网申入口',
        tag: '官方直聘',
        url: matchedItems[0]?.apply_url || `https://www.baidu.com/s?wd=${encodedKw}%20校园招聘%20官网`,
        desc: '直通企业官方 ATS 招聘网申系统，查阅全部校招岗位与投递进度',
        icon: 'globe',
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
      },
      {
        title: isPharma ? '丁香人才医药校招专区' : '牛客网校招职位广场',
        tag: isPharma ? '医药垂直' : '大厂校招',
        url: isPharma ? `https://www.jobmd.cn/work/search.htm?keyword=${encodedKw}` : `https://www.nowcoder.com/jobs/school/jobs?search=${encodedKw}`,
        desc: `查阅 ${this.escapeHtml(kw)} 在${isPharma ? '丁香人才' : '牛客网'}的全部开放岗位与真实笔面试经验`,
        icon: 'award',
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
      },
      {
        title: '实习僧 (在招日常/暑期/转正)',
        tag: '实习直聘',
        url: `https://www.shixiseng.com/interns?k=${encodedKw}`,
        desc: `查看 ${this.escapeHtml(kw)} 正在招募的实习生、提前批与日常开放职位`,
        icon: 'zap',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      },
      {
        title: '前程无忧 51Job 招聘专区',
        tag: '全量岗位',
        url: `https://search.51job.com/list/000000,000000,0000,00,9,99,${encodedKw},2,1.html`,
        desc: `检索 ${this.escapeHtml(kw)} 全国各分支机构在招的全部校招职位`,
        icon: 'briefcase',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      },
      {
        title: '微信公众号官方校招推文',
        tag: '推文长图',
        url: `https://weixin.sogou.com/weixin?type=2&query=${encodedKw}%202026%20校园招聘`,
        desc: `查阅 ${this.escapeHtml(kw)} 官方公众号发布的完整招聘长图、各事业部在招详情及宣讲行程`,
        icon: 'message-circle',
        badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
      },
      {
        title: '重点高校就业网官方通告',
        tag: '985/211高校',
        url: `https://www.baidu.com/s?wd=${encodedKw}%20(site:pku.edu.cn%20OR%20site:sjtu.edu.cn%20OR%20site:tsinghua.edu.cn%20OR%20site:hust.edu.cn)%20招聘`,
        desc: '一键查看北大、交大、清华等高校就业中心官方发布的专场简章与招聘需求',
        icon: 'graduation-cap',
        badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      }
    ];

    return `
      <div class="col-span-full bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-900/60 dark:from-indigo-950/40 dark:via-slate-900/80 dark:to-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-sm mb-2">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 flex-shrink-0">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>「${this.escapeHtml(kw)}」全岗位透视 & 官方直聘网申矩阵</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-mono">聚合 ${matchedItems.length} 个专场 / ${allRoles.length} 个细分岗位</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">已全面展开在招细分方向，支持直接点选具体岗位导入看板，或直达官方 ATS 与平台全量职位库</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button data-company="${this.escapeHtml(kw)}" onclick="CompanyManager.openCompanyModal(this.dataset.company)" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95">
              <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
              <span>查企业背调</span>
            </button>
            <button onclick="CampusRadar.triggerLiveSearch('${this.escapeHtml(kw)}')" class="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95">
              <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              <span>全网高校通告</span>
            </button>
            <button onclick="CampusRadar.resetFilters()" class="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              <span>清空搜索</span>
            </button>
          </div>
        </div>

        ${allRoles.length > 0 ? `
          <!-- Extracted Roles Matrix -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <span class="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
                <span>在招岗位全景清单 (点击任意岗位可一键转入【待投递】列)：</span>
              </span>
              <span class="text-[11px] text-slate-400 font-normal">支持独立精准投递</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${allRoles.map(r => `
                <button type="button" onclick="CampusRadar.importSpecificRole(${r.recruitId}, '${this.escapeHtml(r.role)}')" class="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500/60 px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-xs group/r cursor-pointer" title="点击直接将「${this.escapeHtml(r.role)}」(${this.escapeHtml(r.type)})导入看板">
                  <span class="font-bold">${this.escapeHtml(r.role)}</span>
                  <span class="text-[10px] text-slate-400 group-hover/r:text-indigo-400 font-mono">(${this.escapeHtml(r.type.replace(/秋招正式批|秋招提前批/g, '').replace(/[()（）]/g, '') || '校招')})</span>
                  <span class="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 rounded font-semibold">+导入</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 6 Direct Gateways -->
        <div class="space-y-2 pt-1">
          <div class="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <i data-lucide="compass" class="w-3.5 h-3.5 text-indigo-500"></i>
            <span>6大官方直聘与全网全量职位通道 (覆盖 100% 官方在招岗位)：</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            ${gateways.map(g => `
              <a href="${g.url}" target="_blank" class="bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 p-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-start gap-2.5 group/gw">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/gw:bg-indigo-600 group-hover/gw:text-white transition-colors flex-shrink-0">
                  <i data-lucide="${g.icon}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-xs font-bold text-slate-900 dark:text-white group-hover/gw:text-indigo-600 dark:group-hover/gw:text-indigo-400 truncate">${g.title}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded border font-semibold flex-shrink-0 ${g.badgeColor}">${g.tag}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${g.desc}</p>
                </div>
                <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400 group-hover/gw:text-indigo-500 flex-shrink-0 mt-0.5"></i>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Live Campus Notices In Search Matrix -->
        <div id="campus-discovery-live-box" class="pt-2 border-t border-indigo-500/20 hidden">
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold mb-2">
            <span class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
              <span>各大高校就业网实时通告动态发现：</span>
            </span>
            <span class="text-[10px] text-slate-400">实时抓取自北大、交大等高校就业网</span>
          </div>
          <div id="campus-discovery-live-items" class="grid grid-cols-1 md:grid-cols-2 gap-2.5"></div>
        </div>
      </div>
    `;
  },

  loadDiscoveryLiveNotices(kw) {
    API.liveSearchCampus(kw).then(data => {
      if (data && data.results && data.results.length > 0) {
        const boxEl = document.getElementById('campus-discovery-live-box');
        const itemsEl = document.getElementById('campus-discovery-live-items');
        if (boxEl && itemsEl) {
          boxEl.classList.remove('hidden');
          itemsEl.innerHTML = data.results.slice(0, 4).map((r, idx) => `
            <div class="bg-white/80 dark:bg-slate-900/80 border border-purple-200/70 dark:border-purple-900/50 p-2.5 rounded-xl text-xs space-y-1">
              <div class="flex items-center justify-between gap-1">
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate">${CampusRadar.escapeHtml(r.display_title || r.company_name)}</span>
                <span class="text-[10px] text-purple-600 dark:text-purple-400 font-mono">${CampusRadar.escapeHtml(r.recruitment_type)}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">${CampusRadar.escapeHtml(r.announcement_text)}</p>
              <div class="flex items-center justify-between pt-1">
                <a href="${r.apply_url}" target="_blank" class="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                  <span>查看通告</span>
                  <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
                <button onclick="CampusRadar.importLiveCampusItem(${idx})" class="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-100 px-2 py-0.5 rounded font-semibold transition-colors">
                  +收录到情报站
                </button>
              </div>
            </div>
          `).join('');
          CampusRadar._tempDiscoveryLiveResults = data.results;
          lucide.createIcons();
        }
      }
    }).catch(() => {});
  },

  importLiveCampusItem(idx) {
    if (!this._tempDiscoveryLiveResults || !this._tempDiscoveryLiveResults[idx]) return;
    this.currentLiveResults = this._tempDiscoveryLiveResults;
    this.importLiveByIndex(idx);
  },

  renderCards() {
    const container = document.getElementById('campus-recruits-grid');
    if (!container) return;

    if (this.recruits.length === 0) {
      const hasFilter = Boolean(this.filters.keyword || (this.filters.industry && this.filters.industry !== 'all') || (this.filters.recruitment_type && this.filters.recruitment_type !== 'all') || (this.filters.target_graduates && this.filters.target_graduates !== 'all') || (this.filters.status && this.filters.status !== 'all'));
      const hasTotalData = Boolean(this.stats && this.stats.total_companies > 0);

      if (hasFilter || hasTotalData) {
        const kw = this.filters.keyword || '';
        const escapedKw = this.escapeHtml(kw);
        container.innerHTML = `
          <div class="col-span-full py-12 px-6 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-center">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <i data-lucide="search-x" class="w-7 h-7"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">
                ${kw ? `未在已收录的校招日程中检索到与「${escapedKw}」相关的招聘批次` : '当前筛选条件下暂无匹配的校招企业'}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
                ${kw ? `该企业或岗位可能尚未录入本地校招日程，或已更名。您可以直接启动【企业全景背调】查验该企业背景、加班指数与真实口碑，或一键全网搜索其最新招聘推文：` : '您可以尝试切换行业分类或重置筛选条件以查看全部校招动态。'}
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
              ${kw ? `
                <button data-kw="${escapedKw}" onclick="CampusRadar.triggerLiveSearch(this.dataset.kw)" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all active:scale-95">
                  <i data-lucide="globe" class="w-4 h-4"></i>
                  <span>立即全网实时检索「${escapedKw}」校招简章</span>
                </button>
                <button data-company="${escapedKw}" onclick="CompanyManager.openCompanyModal(this.dataset.company)" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95">
                  <i data-lucide="building-2" class="w-4 h-4"></i>
                  <span>企业全景背调画像</span>
                </button>
                <a href="https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(kw + ' 2026 校招')}" target="_blank" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95">
                  <i data-lucide="search" class="w-4 h-4"></i>
                  <span>微信校招推文</span>
                </a>
              ` : ''}
              <button onclick="CampusRadar.resetFilters()" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                <span>清空搜索与筛选 (查看全部 ${this.stats.total_companies || ''} 家企业)</span>
              </button>
            </div>

            <!-- Asynchronous Live Search Results Container -->
            ${kw ? `
              <div id="campus-live-search-container" class="max-w-4xl mx-auto pt-4 text-left">
                <div id="campus-live-search-loader" class="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-xs">正在自动穿透全网检索「${escapedKw}」各大高校就业网与最新公开校招简章...</span>
                </div>
                <div id="campus-live-search-list" class="grid grid-cols-1 md:grid-cols-2 gap-3.5 hidden"></div>
              </div>
            ` : ''}

            <!-- Asynchronous Embedded Company Profile Preview if keyword is present -->
            ${kw ? `<div id="campus-search-company-preview" class="max-w-4xl mx-auto pt-2 text-left"></div>` : ''}
          </div>
        `;
        lucide.createIcons();

        // 异步执行全网实时动态校招检索与企业背调画像加载
        if (kw) {
          // 1. 全网实时校招简章与高校就业网检索
          API.liveSearchCampus(kw).then(data => {
            const loaderEl = document.getElementById('campus-live-search-loader');
            const listEl = document.getElementById('campus-live-search-list');
            if (loaderEl) loaderEl.remove();

            if (data && data.results && data.results.length > 0) {
              CampusRadar.currentLiveResults = data.results;
              if (listEl) {
                listEl.classList.remove('hidden');
                listEl.innerHTML = data.results.map((item, idx) => `
                  <div class="bg-slate-50 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <i data-lucide="globe" class="w-3 h-3"></i>
                          <span>实时网络检索发现</span>
                        </span>
                        <span class="text-[11px] text-slate-400">${CampusRadar.escapeHtml(item.recruitment_type)}</span>
                      </div>
                      <h5 class="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">${CampusRadar.escapeHtml(item.display_title || item.company_name)}</h5>
                      <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">${CampusRadar.escapeHtml(item.announcement_text)}</p>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 gap-2">
                      ${item.apply_url ? `
                        <a href="${item.apply_url}" target="_blank" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                          <span>查看公告/网申</span>
                          <i data-lucide="external-link" class="w-3 h-3"></i>
                        </a>
                      ` : '<span></span>'}
                      <button onclick="CampusRadar.importLiveByIndex(${idx})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-xs active:scale-95">
                        <i data-lucide="download" class="w-3 h-3"></i>
                        <span>收录进情报站</span>
                      </button>
                    </div>
                  </div>
                `).join('');
                lucide.createIcons();
              }
            }
          }).catch(e => {
            const loaderEl = document.getElementById('campus-live-search-loader');
            if (loaderEl) loaderEl.remove();
          });

          // 2. 异步加载企业画像
          API.getCompanyProfile(kw).then(p => {
            const previewEl = document.getElementById('campus-search-company-preview');
            if (previewEl && p) {
              const wlbColors = {
                green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              };
              const badgeCls = wlbColors[p.wlb_badge] || wlbColors.yellow;
              previewEl.innerHTML = `
                <div class="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-[10px] font-bold tracking-wide uppercase text-indigo-500">🏢 关联企业全景画像与背调洞察</span>
                      <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">${CampusRadar.escapeHtml(p.name)}</h4>
                    </div>
                    <span class="text-[11px] px-2.5 py-0.5 rounded-full border ${badgeCls} font-medium">
                      ${CampusRadar.escapeHtml(p.wlb_level || '常规')}
                    </span>
                  </div>
                  <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p><span class="text-slate-400">行业性质：</span>${CampusRadar.escapeHtml(p.company_type || '')} · ${CampusRadar.escapeHtml(p.industry || '')}</p>
                    <p><span class="text-slate-400">工时考勤：</span>${CampusRadar.escapeHtml(p.work_hours || '标准双休')}</p>
                    <p><span class="text-slate-400">薪酬福利：</span>${CampusRadar.escapeHtml(p.salary_benefits || '按企业标准发放')}</p>
                  </div>
                  <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span class="text-[11px] text-slate-400">外部背调直达:</span>
                    <div class="flex items-center gap-1.5 text-xs">
                      <a href="https://www.tianyancha.com/search?key=${encodeURIComponent(p.name)}" target="_blank" class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-[11px] hover:underline">天眼查</a>
                      <a href="https://www.kanzhun.com/companyl/search/?q=${encodeURIComponent(p.name)}" target="_blank" class="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded text-[11px] hover:underline">看准网</a>
                      <a href="https://maimai.cn/web/search_center?type=feed&query=${encodeURIComponent(p.name)}" target="_blank" class="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 rounded text-[11px] hover:underline">脉脉</a>
                      <button data-company="${CampusRadar.escapeHtml(p.name)}" onclick="CompanyManager.openCompanyModal(this.dataset.company)" class="ml-2 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-semibold hover:bg-indigo-500">查看完整画像</button>
                    </div>
                  </div>
                </div>
              `;
              lucide.createIcons();
            }
          }).catch(() => {});
        }
        return;
      }


      container.innerHTML = `
        <div class="col-span-full py-16 px-6 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i data-lucide="shield-check" class="w-7 h-7"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">当前处于纯净状态（无任何内置示例数据）</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
              系统严格遵循您的要求，未预置任何虚拟示例数据。您可以根据需要，随时从公开真实渠道获取最新校招动态：
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onclick="CampusRadar.syncAll()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>从公开开源源抓取真实校招日程</span>
            </button>
            <button onclick="CampusRadar.openParseModal()" class="bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
              <i data-lucide="bot" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i>
              <span>AI 提取真实推文/就业网公告</span>
            </button>
          </div>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const sortFilter = document.getElementById('campus-sort-filter')?.value || 'default';

    // Helper for deadline parsing
    const parseDeadline = (d) => {
      if (!d) return Infinity; // No deadline -> goes to bottom if asc
      const match = d.match(/20\d{2}[-/年]\d{1,2}[-/月]\d{1,2}/);
      if (match) {
        let cleanDate = match[0].replace(/[年月]/g, '-').replace(/日/g, '');
        return new Date(cleanDate).getTime();
      }
      return Infinity;
    };

    let renderData = [...this.recruits];
    renderData.sort((a, b) => {
      if (sortFilter === 'deadline_asc') {
        return parseDeadline(a.deadline) - parseDeadline(b.deadline);
      } else if (sortFilter === 'latest_desc') {
        const da = a.created_at ? new Date(a.created_at) : new Date(0);
        const db = b.created_at ? new Date(b.created_at) : new Date(0);
        return db - da;
      }
      return 0; // Default order
    });

    const kw = (this.filters.keyword || '').trim();
    const discoveryHtml = kw ? this.renderCompanyDiscoverySection(kw, renderData) : '';

    // 1. 平铺网格视图模式 (Flat Mode)
    if (this.viewMode === 'flat') {
      container.innerHTML = `
        <div class="space-y-5">
          ${discoveryHtml}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${renderData.map((item) => this.renderCardHtml(item, this.recruits.indexOf(item))).join('')}
          </div>
        </div>
      `;
      lucide.createIcons();
      if (kw) this.loadDiscoveryLiveNotices(kw);
      return;
    }

    // 2. 按分类分组展示模式 (Grouped Sections Mode)
    const groups = [
      { key: '互联网', title: '💻 互联网 / IT 软件大厂', desc: '含算法工程、后端架构、前端移动端、云计算及全球化核心业务', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30' },
      { key: '制造', title: '⚡ 智能制造 / 汽车芯片 / 硬科技', desc: '含新能源整车研发、动力电池、先进制程半导体、嵌入式及智能控制', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30' },
      { key: '医疗', title: '🏥 医疗健康 / 生物医药 / 医疗器械', desc: '含高端医学影像算法、新药临床研发(CRA/CRC)、生物信息及精准医疗', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30' },
      { key: '国企', title: '🏛️ 央企国企 / 重点科研院所', desc: '含国家电网、通信运营商、核工业、航天科工与大国重器工程', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30' },
      { key: '金融', title: '💰 金融科技 / 商业银行 / 证券量化', desc: '含总行金融科技管培、分布式金融架构、量化策略及资产管理', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30' },
      { key: '消费', title: '🛍️ 综合商贸 / 消费品制造 / 智能家电', desc: '含智能家居物联网、快消品牌营销战略、全渠道供应链及全球管培', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30' }
    ];

    const groupedData = {};
    groups.forEach(g => groupedData[g.key] = []);
    const otherItems = [];

    renderData.forEach((item, _loopIndex) => {
      // Find original index for actions (e.g. previewAnnouncement)
      const index = this.recruits.indexOf(item);
      item._index = index;
      const ind = item.industry || '';
      let placed = false;
      for (const g of groups) {
        if (ind.includes(g.key)) {
          groupedData[g.key].push(item);
          placed = true;
          break;
        }
      }
      if (!placed) {
        otherItems.push(item);
      }
    });

    let sectionsHtml = '';

    for (const g of groups) {
      const items = groupedData[g.key] || [];
      if (items.length === 0) continue;

      const isCollapsed = !!this.collapsedGroups[g.key];

      sectionsHtml += `
        <div class="campus-category-section bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 transition-all shadow-xs">
          <!-- Category Section Header -->
          <div class="flex items-center justify-between cursor-pointer select-none" onclick="CampusRadar.toggleGroup('${g.key}')">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>${g.title}</span>
              </span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full border ${g.badgeClass}">
                ${items.length} 家名企
              </span>
              <span class="hidden md:inline text-xs text-slate-400 dark:text-slate-500">
                · ${g.desc}
              </span>
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <span id="campus-group-label-${g.key}">${isCollapsed ? '展开' : '收起'}</span>
              <i id="campus-group-icon-${g.key}" data-lucide="chevron-down" class="w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}"></i>
            </div>
          </div>

          <!-- Cards Grid in Category -->
          <div id="campus-group-content-${g.key}" class="${isCollapsed ? 'hidden' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            ${items.map(it => this.renderCardHtml(it, it._index)).join('')}
          </div>
        </div>
      `;
    }

    if (otherItems.length > 0) {
      const isOtherCollapsed = !!this.collapsedGroups['other'];
      sectionsHtml += `
        <div class="campus-category-section bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 transition-all shadow-xs">
          <div class="flex items-center justify-between cursor-pointer select-none" onclick="CampusRadar.toggleGroup('other')">
            <div class="flex items-center gap-2.5">
              <span class="text-base font-bold text-slate-800 dark:text-slate-100">🌐 综合名企校招</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                ${otherItems.length} 家企业
              </span>
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <span id="campus-group-label-other">${isOtherCollapsed ? '展开' : '收起'}</span>
              <i id="campus-group-icon-other" data-lucide="chevron-down" class="w-4 h-4 transition-transform ${isOtherCollapsed ? '-rotate-90' : ''}"></i>
            </div>
          </div>
          <div id="campus-group-content-other" class="${isOtherCollapsed ? 'hidden' : ''} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            ${otherItems.map(it => this.renderCardHtml(it, it._index)).join('')}
          </div>
        </div>
      `;
    }

    if (discoveryHtml) {
      container.innerHTML = `
        <div class="space-y-5">
          ${discoveryHtml}
          ${sectionsHtml}
        </div>
      `;
      lucide.createIcons();
      if (kw) this.loadDiscoveryLiveNotices(kw);
    } else {
      container.innerHTML = sectionsHtml;
      lucide.createIcons();
    }
  },

  async copyReferralCode(code) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      App.showToast(`🎉 内推码「${code}」已成功复制到剪贴板！`, 'success');
    } catch (e) {
      App.showToast(`内推码: ${code} (请手动复制)`, 'info');
    }
  },

  async importToJob(recruitId) {
    try {
      const res = await API.importCampusToJob(recruitId);
      App.showToast(res.message, 'success');
      App.refreshStats();
      if (window.Kanban && typeof Kanban.loadAndRenderJobs === 'function') {
        Kanban.loadAndRenderJobs();
      }
    } catch (e) {
      App.showToast('转入看板失败: ' + e.message, 'error');
    }
  },

  async importSpecificRole(recruitId, roleName) {
    try {
      const res = await API.importCampusToJob(recruitId, roleName);
      App.showToast(res.message, 'success');
      App.refreshStats();
      if (window.Kanban && typeof Kanban.loadAndRenderJobs === 'function') {
        Kanban.loadAndRenderJobs();
      }
    } catch (e) {
      App.showToast('导入岗位失败: ' + e.message, 'error');
    }
  },

  async syncAll() {
    const btn = document.getElementById('btn-campus-sync');
    const originalHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 同步全网中...`;
    }

    try {
      const res = await API.syncCampusRecruits();
      App.showToast(res.message, 'success');
      await this.loadData();
    } catch (e) {
      App.showToast('同步失败: ' + e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
        lucide.createIcons();
      }
    }
  },

  openParseModal() {
    const modal = document.getElementById('campus-parse-modal');
    if (modal) {
      document.getElementById('campus-article-input').value = '';
      document.getElementById('campus-article-url').value = '';
      document.getElementById('campus-parse-result').classList.add('hidden');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  async handleArticleParse() {
    const textEl = document.getElementById('campus-article-input');
    const urlEl = document.getElementById('campus-article-url');
    const parseBtn = document.getElementById('btn-do-campus-parse');
    const resultBox = document.getElementById('campus-parse-result');

    const text = textEl ? textEl.value.trim() : '';
    const url = urlEl ? urlEl.value.trim() : '';

    if (!text) {
      App.showToast('请粘贴微信公众号推文或学校就业网公告文本', 'warning');
      return;
    }

    const originalText = parseBtn.innerHTML;
    parseBtn.disabled = true;
    parseBtn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AI 正在深度结构化提取...`;

    try {
      const res = await API.parseCampusArticle(text, url);
      App.showToast(res.message, 'success');

      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl space-y-2 text-xs">
            <div class="flex items-center gap-2 text-emerald-400 font-bold">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
              <span>已成功提取并录入「${CampusRadar.escapeHtml(res.recruit.company_name)}」！</span>
            </div>
            <div class="text-slate-300 space-y-1">
              <p>• 行业: <strong>${CampusRadar.escapeHtml(res.recruit.industry)}</strong> (${CampusRadar.escapeHtml(res.recruit.recruitment_type)})</p>
              <p>• 届别: <strong>${CampusRadar.escapeHtml(res.recruit.target_graduates)}</strong> | 截止日期: <strong>${CampusRadar.escapeHtml(res.recruit.deadline || '未注明')}</strong></p>
              <p>• 招募方向: ${CampusRadar.escapeHtml(res.recruit.roles_summary)}</p>
              ${res.recruit.referral_code ? `<p>• 内推码: <strong class="text-amber-300 font-mono">${CampusRadar.escapeHtml(res.recruit.referral_code)}</strong></p>` : ''}
            </div>
          </div>
        `;
      }

      await this.loadData();
      lucide.createIcons();
    } catch (e) {
      App.showToast('提取失败: ' + e.message, 'error');
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  },

  previewAnnouncement(index) {
    const item = this.recruits[index];
    if (!item) return;

    const modal = document.getElementById('preview-jd-modal');
    const titleEl = document.getElementById('preview-jd-title');
    const textEl = document.getElementById('preview-jd-text');

    if (modal && titleEl && textEl) {
      titleEl.innerText = `${item.company_name} - ${item.recruitment_type} (${item.target_graduates})`;
      textEl.innerText = `【企业/单位】: ${item.company_name}\n【所属行业】: ${item.industry}\n【招聘批次】: ${item.recruitment_type}\n【面向届别】: ${item.target_graduates}\n【网申截止】: ${item.deadline || '招满即止'}\n【官方网申】: ${item.apply_url || '详见公告'}\n【内推码】: ${item.referral_code || '暂无'}\n\n【招募岗位方向与专业要求】:\n${item.roles_summary}\n\n【详细通告详情】:\n${item.announcement_text || '暂无更多通告文本'}`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  async openCompanyAllPositionsModal(companyName) {
    if (!companyName) return;
    const modal = document.getElementById('company-positions-modal');
    const titleEl = document.getElementById('company-positions-modal-title');
    const subtitleEl = document.getElementById('company-positions-modal-subtitle');
    const bodyEl = document.getElementById('company-positions-modal-body');

    if (!modal || !bodyEl) return;

    if (titleEl) {
      titleEl.innerHTML = `<span>「${this.escapeHtml(companyName)}」全量校招岗位透视矩阵</span>`;
    }
    if (subtitleEl) {
      subtitleEl.innerText = `正在穿透检索全景专场与细分在招岗位...`;
    }

    bodyEl.innerHTML = `
      <div class="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div class="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs font-semibold text-slate-200">正在穿透全网全景检索「${this.escapeHtml(companyName)}」所有校招专场与细分在招岗位...</p>
      </div>
    `;

    App.openModal('company-positions-modal');

    try {
      const data = await API.getCompanyAllPositions(companyName);
      const matched = data.local_tracks || [];
      const roles = data.extracted_roles || [];
      const gateways = data.official_gateways || [];

      if (subtitleEl) {
        subtitleEl.innerText = `聚合 ${matched.length} 个招聘专场 · 提取 ${roles.length} 个结构化在招细分岗位 · 6大官方与垂直网申直聘通道`;
      }

      bodyEl.innerHTML = `
        <!-- Roles Chips Section -->
        <div class="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/40 rounded-2xl p-4.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <i data-lucide="crosshair" class="w-4 h-4"></i>
              <span>结构化细分在招岗位清单 (${roles.length} 个方向，点击任意岗位直接转入【待投递】看板)：</span>
            </span>
            <span class="text-[11px] text-slate-400">支持独立精准投递</span>
          </div>

          ${roles.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${roles.map(r => `
                <button type="button" onclick="CampusRadar.importSpecificRole(${r.recruit_id}, '${CampusRadar.escapeHtml(r.role_name)}')" class="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200 hover:border-purple-400 dark:border-slate-800 dark:hover:border-purple-500/60 px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-xs group/r cursor-pointer" title="点击直接将「${CampusRadar.escapeHtml(r.role_name)}」(${CampusRadar.escapeHtml(r.recruitment_type)})导入看板">
                  <span class="font-bold">${CampusRadar.escapeHtml(r.role_name)}</span>
                  <span class="text-[10px] text-slate-400 group-hover/r:text-purple-400 font-mono">(${CampusRadar.escapeHtml((r.recruitment_type || '').replace(/秋招正式批|秋招提前批/g, '').replace(/[()（）]/g, '') || '校招')})</span>
                  <span class="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded font-semibold">+导入</span>
                </button>
              `).join('')}
            </div>
          ` : `
            <p class="text-xs text-slate-400 py-1">暂无提取到结构化细分标签，可通过下方专场直接投递</p>
          `}
        </div>

        <!-- 6 Direct Gateways -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <i data-lucide="compass" class="w-4 h-4 text-purple-500"></i>
            <span>6大官方直聘与全网全量职位通道 (覆盖 100% 官方在招岗位)：</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${gateways.map(g => `
              <a href="${g.url}" target="_blank" class="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-600 p-3 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-start gap-2.5 group/gw">
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover/gw:bg-purple-600 group-hover/gw:text-white transition-colors flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  <i data-lucide="${g.icon}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="text-xs font-bold text-slate-900 dark:text-white group-hover/gw:text-purple-600 dark:group-hover/gw:text-purple-400 truncate">${CampusRadar.escapeHtml(g.name)}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded border font-semibold flex-shrink-0 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800">${CampusRadar.escapeHtml(g.tag)}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${CampusRadar.escapeHtml(g.desc)}</p>
                </div>
                <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400 group-hover/gw:text-purple-500 flex-shrink-0 mt-0.5"></i>
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Local Specialized Tracks -->
        <div class="space-y-3">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <i data-lucide="layers" class="w-4 h-4 text-indigo-500"></i>
            <span>在招细分赛道与招聘批次专场全景 (${matched.length} 个专场)：</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            ${matched.map(item => `
              <div class="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100">${CampusRadar.escapeHtml(item.recruitment_type)}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">${CampusRadar.escapeHtml(item.target_graduates || '2026/2027届')}</span>
                  </div>
                  <p class="text-xs text-indigo-700 dark:text-indigo-300 font-medium mt-1.5">${CampusRadar.escapeHtml(item.roles_summary)}</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${CampusRadar.escapeHtml(item.announcement_text || '')}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span class="text-[11px] text-slate-400">截止: ${CampusRadar.escapeHtml(item.deadline || '招满即止')}</span>
                  <div class="flex items-center gap-2">
                    ${item.apply_url ? `
                      <a href="${item.apply_url}" target="_blank" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <span>网申入口</span>
                        <i data-lucide="external-link" class="w-3 h-3"></i>
                      </a>
                    ` : ''}
                    <button onclick="CampusRadar.importToJob(${item.id})" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                      <i data-lucide="plus" class="w-3 h-3"></i>
                      <span>导入看板</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      lucide.createIcons();
    } catch (err) {
      bodyEl.innerHTML = `<div class="p-8 text-center text-rose-400 text-xs font-semibold">加载全岗位透视失败: ${CampusRadar.escapeHtml(err.message)}</div>`;
    }
  },

  async purgeAll() {
    if (!confirm('确定要清空本地所有已抓取的秋招情报记录吗？（清空后可随时重新同步）')) return;
    try {
      const res = await API.purgeCampusRecruits();
      App.showToast(res.message, 'info');
      await this.loadData();
    } catch (e) {
      App.showToast('清空失败: ' + e.message, 'error');
    }
  }
};

