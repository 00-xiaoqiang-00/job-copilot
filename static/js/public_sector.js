// Public Sector & Civil Service Radar Controller (考公考编与央国企专区)
const PublicSectorRadar = {
  recruits: [],
  stats: {},
  currentCategory: 'all',
  currentRegion: 'all',
  currentStatus: 'all',
  searchKeyword: '',

  init() {
    this.setupEventListeners();
    this.loadData();
  },

  setupEventListeners() {
    // 搜索输入框
    const searchInput = document.getElementById('public-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchKeyword = e.target.value.trim();
          this.loadData();
        }, 300);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.searchKeyword = e.target.value.trim();
          this.loadData();
        }
      });
    }

    // 编制类别筛选胶囊
    document.querySelectorAll('.public-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-cat') || 'all';
        this.setCategory(cat);
      });
    });

    // 省份/区域胶囊筛选
    document.querySelectorAll('.public-region-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reg = e.currentTarget.getAttribute('data-region') || 'all';
        this.setRegion(reg);
      });
    });

    // 状态筛选
    const statusSelect = document.getElementById('public-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentStatus = e.target.value;
        this.loadData();
      });
    }

    // 同步按钮
    const syncBtn = document.getElementById('btn-public-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.syncAll());
    }

    // 提取推文模态框按钮
    const openParseBtn = document.getElementById('btn-open-public-parse');
    if (openParseBtn) {
      openParseBtn.addEventListener('click', () => this.openParseModal());
    }

    const sortFilter = document.getElementById('public-sort-filter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => this.renderCards());
    }
  },

  setCategory(cat) {
    this.currentCategory = cat;
    document.querySelectorAll('.public-cat-btn').forEach(b => {
      if (b.getAttribute('data-cat') === cat) {
        b.className = 'public-cat-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-rose-600 text-white shadow-sm shadow-rose-600/30';
      } else {
        b.className = 'public-cat-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60';
      }
    });
    this.loadData();
  },

  setRegion(region) {
    this.currentRegion = region;
    document.querySelectorAll('.public-region-btn').forEach(b => {
      if (b.getAttribute('data-region') === region) {
        b.className = 'public-region-btn px-3 py-1 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm';
      } else {
        b.className = 'public-region-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50';
      }
    });
    this.loadData();
  },

  async loadData() {
    try {
      const [recruits, stats] = await Promise.all([
        API.getPublicRecruits({
          category: this.currentCategory,
          region: this.currentRegion,
          status: this.currentStatus,
          keyword: this.searchKeyword
        }),
        API.getPublicStats()
      ]);

      this.recruits = recruits || [];
      this.stats = stats || {};

      this.renderStats();
      this.renderCards();
    } catch (e) {
      console.error("Load Public Sector Recruits Failed:", e);
      App.showToast("加载考公考编数据失败: " + e.message, "error");
    }
  },

  renderStats() {
    const s = this.stats;
    const totalEl = document.getElementById('stat-public-total');
    const civilEl = document.getElementById('stat-public-civil');
    const scoutEl = document.getElementById('stat-public-scout');
    const instEl = document.getElementById('stat-public-inst');
    const soeEl = document.getElementById('stat-public-soe');
    const endingEl = document.getElementById('stat-public-ending');

    if (totalEl) totalEl.innerText = s.total_recruits || 0;
    if (civilEl) civilEl.innerText = s.civil_servant_count || 0;
    if (scoutEl) scoutEl.innerText = s.talent_scout_count || 0;
    if (instEl) instEl.innerText = s.institution_count || 0;
    if (soeEl) soeEl.innerText = s.soe_count || 0;
    if (endingEl) endingEl.innerText = s.ending_count || 0;
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

  resetFilters() {
    this.currentCategory = 'all';
    this.currentRegion = 'all';
    this.currentStatus = 'all';
    this.searchKeyword = '';

    const searchInput = document.getElementById('public-search-input');
    if (searchInput) searchInput.value = '';

    const statusSelect = document.getElementById('public-status-filter');
    if (statusSelect) statusSelect.value = 'all';

    document.querySelectorAll('.public-cat-btn').forEach(b => {
      b.className = (b.getAttribute('data-cat') === 'all')
        ? 'public-cat-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-rose-600 text-white shadow-sm shadow-rose-600/30'
        : 'public-cat-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60';
    });

    document.querySelectorAll('.public-region-btn').forEach(b => {
      b.className = (b.getAttribute('data-region') === 'all')
        ? 'public-region-btn px-3 py-1 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm'
        : 'public-region-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50';
    });

    this.loadData();
  },

  renderCards() {
    const container = document.getElementById('public-recruits-grid');
    if (!container) return;

    if (this.recruits.length === 0) {
      const hasFilter = Boolean(this.searchKeyword || this.currentCategory !== 'all' || this.currentRegion !== 'all' || this.currentStatus !== 'all');
      const hasTotalData = Boolean(this.stats && this.stats.total_recruits > 0);

      if (hasFilter || hasTotalData) {
        const kw = this.searchKeyword || '';
        const escapedKw = this.escapeHtml(kw);
        container.innerHTML = `
          <div class="col-span-full py-12 px-6 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm text-center">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <i data-lucide="search-x" class="w-7 h-7"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">
                ${kw ? `未在已收录的招录库中检索到与「${escapedKw}」相关的公告` : '当前筛选条件下暂无匹配的招考公告'}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
                ${kw ? `该招考单位可能属于地方刚发布的增量公告，您可以查验该单位背景或直接在全网检索最新公考通告：` : '您可以尝试切换招录类别、报考省份或重置筛选条件以查看全部招录信息。'}
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
              ${kw ? `
                <button data-company="${escapedKw}" onclick="CompanyManager.openCompanyModal(this.dataset.company)" class="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all active:scale-95">
                  <i data-lucide="building-2" class="w-4 h-4"></i>
                  <span>查验「${escapedKw}」单位背景与属性</span>
                </button>
                <a href="https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(kw + ' 招聘公告')}" target="_blank" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95">
                  <i data-lucide="globe" class="w-4 h-4"></i>
                  <span>全网搜索「${escapedKw}」最新招录公告</span>
                </a>
              ` : ''}
              <button onclick="PublicSectorRadar.resetFilters()" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                <span>清空搜索与筛选 (查看全部 ${this.stats.total_recruits || ''} 条招考)</span>
              </button>
            </div>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = `
        <div class="col-span-full py-16 px-6 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <i data-lucide="landmark" class="w-7 h-7"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">当前处于纯净状态（无任何内置示例数据）</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
              系统严格遵循您的要求，未预置任何虚拟或示例招录数据。您可以随时通过以下方式自主获取 100% 真实的考公、选调与国企招录日程：
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onclick="PublicSectorRadar.syncAll()" class="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all active:scale-95">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              <span>从公开开源源抓取真实招考日程</span>
            </button>
            <button onclick="PublicSectorRadar.openParseModal()" class="bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
              <i data-lucide="bot" class="w-4 h-4 text-purple-500"></i>
              <span>AI 提取真实考公推文 / 人事网公告</span>
            </button>
          </div>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const sortFilter = document.getElementById('public-sort-filter')?.value || 'default';

    const parseDate = (d) => {
      if (!d) return Infinity;
      const match = d.match(/20\d{2}[-/年]\d{1,2}[-/月]\d{1,2}/);
      if (match) {
        let cleanDate = match[0].replace(/[年月]/g, '-').replace(/日/g, '');
        return new Date(cleanDate).getTime();
      }
      return Infinity;
    };

    let renderData = [...this.recruits];
    renderData.sort((a, b) => {
      if (sortFilter === 'apply_end_asc') {
        return parseDate(a.apply_end_date) - parseDate(b.apply_end_date);
      } else if (sortFilter === 'exam_date_asc') {
        return parseDate(a.exam_date) - parseDate(b.exam_date);
      } else if (sortFilter === 'latest_desc') {
        const da = a.created_at ? new Date(a.created_at) : new Date(0);
        const db = b.created_at ? new Date(b.created_at) : new Date(0);
        return db - da;
      }
      return 0; // Default order
    });

    container.innerHTML = renderData.map((item) => {
      // Find original index
      const index = this.recruits.indexOf(item);
      const isEnding = item.status === 'ending';
      const isUpcoming = item.status === 'upcoming';
      const isCivil = (item.category || '').includes('公务员') || (item.category || '').includes('国考') || (item.category || '').includes('省考');
      const isScout = (item.category || '').includes('选调');
      const isInst = (item.category || '').includes('事业');
      const isSoe = (item.category || '').includes('国企') || (item.category || '').includes('央企');

      let catBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      if (isCivil) catBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
      else if (isScout) catBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      else if (isInst) catBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
      else if (isSoe) catBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';

      return `
        <div class="bg-white dark:bg-slate-900/80 border ${isEnding ? 'border-amber-400 dark:border-amber-500/60 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden group">
          
          ${isEnding ? `
            <div class="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-rose-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg shadow flex items-center gap-1">
              <i data-lucide="flame" class="w-3 h-3"></i>
              <span>即将截止</span>
            </div>
          ` : isUpcoming ? `
            <div class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-bl-lg">
              <span>即将开始</span>
            </div>
          ` : ''}

          <div>
            <!-- Top Badges -->
            <div class="flex flex-wrap items-center gap-1.5 mb-2.5 pr-14">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md border ${catBadgeColor}">
                ${this.escapeHtml(item.category)}
              </span>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                📍 ${this.escapeHtml(item.region || '全国')}
              </span>
              ${item.headcount ? `
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  👥 ${this.escapeHtml(item.headcount)}
                </span>
              ` : ''}
            </div>

            <!-- Title & Organization -->
            <h3 class="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              ${this.escapeHtml(item.title)}
            </h3>
            <div class="flex items-center justify-between gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
              <span class="flex items-center gap-1 truncate">
                <i data-lucide="building" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                <span class="truncate">${this.escapeHtml(item.organization)}</span>
              </span>
              <button type="button" data-company="${this.escapeHtml(item.organization)}" data-title="${this.escapeHtml(item.title)}" onclick="event.stopPropagation(); CompanyManager.openProfileModal(this.dataset.company, this.dataset.title)" class="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-1.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors flex-shrink-0" title="查阅招录单位性质与背调">
                <i data-lucide="landmark" class="w-2.5 h-2.5"></i>
                <span>查单位</span>
              </button>
            </div>

            <!-- Key Timelines -->
            <div class="mt-3.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400 text-[11px]">📝 报名周期:</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                  ${item.apply_start_date ? `${this.escapeHtml(item.apply_start_date)} 至 ` : ''}${this.escapeHtml(item.apply_end_date || '招满即止 / 详见公告')}
                </span>
              </div>
              ${item.exam_date ? `
                <div class="flex items-center justify-between pt-0.5 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span class="text-rose-600 dark:text-rose-400 text-[11px] font-medium">🎯 笔试时间:</span>
                  <span class="font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                    ${this.escapeHtml(item.exam_date)}
                  </span>
                </div>
              ` : ''}
            </div>

            <!-- Roles Summary -->
            <div class="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              <span class="text-slate-400 text-[11px]">招录方向: </span>${this.escapeHtml(item.roles_summary || '详见招考职位表附件')}
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <button onclick="PublicSectorRadar.previewAnnouncement(${index})" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1" title="查看简章与职位表详情">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                <span>简章详情</span>
              </button>
              ${item.apply_url ? `
                <a href="${item.apply_url}" target="_blank" class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1" title="打开官方招考报名系统">
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                  <span>报名入口</span>
                </a>
              ` : ''}
            </div>

            <button onclick="PublicSectorRadar.importToJob(${item.id})" class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95" title="一键将该招录转入求职看板，并同步生成报名截止与笔试日历备考事件">
              <i data-lucide="calendar-plus" class="w-3.5 h-3.5"></i>
              <span>转入备考看板</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  },

  async syncAll() {
    const syncBtn = document.getElementById('btn-public-sync');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>同步中...</span>`;
      lucide.createIcons();
    }

    try {
      const res = await API.syncPublicRecruits();
      App.showToast(res.message, "success");
      await this.loadData();
    } catch (e) {
      App.showToast("同步失败: " + e.message, "error");
    } finally {
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i><span>同步全网日程</span>`;
        lucide.createIcons();
      }
    }
  },

  async purgeAll() {
    if (!confirm("确定要清空本地已抓取的考公考编记录吗？（清空后可随时重新同步）")) return;
    try {
      const res = await API.purgePublicRecruits();
      App.showToast(res.message, "info");
      await this.loadData();
    } catch (e) {
      App.showToast("清空失败: " + e.message, "error");
    }
  },

  async importToJob(id) {
    try {
      const res = await API.importPublicRecruitToJob(id);
      App.showToast(res.message, "success");
      App.refreshStats();
      // 若看板已挂载则即时刷新
      if (window.Kanban && typeof Kanban.loadAndRenderJobs === 'function') {
        Kanban.loadAndRenderJobs();
      }
    } catch (e) {
      App.showToast("转入看板失败: " + e.message, "error");
    }
  },

  previewAnnouncement(index) {
    const item = this.recruits[index];
    if (!item) return;

    const modal = document.getElementById('preview-public-modal');
    const titleEl = document.getElementById('preview-public-title');
    const textEl = document.getElementById('preview-public-text');

    if (modal && titleEl && textEl) {
      titleEl.innerText = `${item.organization} - ${item.title}`;
      textEl.innerText = `【公告全称】: ${item.title}\n【招录单位/部门】: ${item.organization}\n【所属省份/地区】: ${item.region}\n【编制类型】: ${item.category}\n【招考人数】: ${item.headcount || '详见简章'}\n【面向届别】: ${item.target_graduates}\n【报名周期】: ${item.apply_start_date ? `${item.apply_start_date} 至 ` : ''}${item.apply_end_date || '详见公告'}\n【笔试统考时间】: ${item.exam_date || '待发布'}\n【官方报名网址】: ${item.apply_url || '详见公告'}\n【简章与职位表出处】: ${item.announcement_url || '详见官方人事考试网'}\n\n【招录专业要求与主要岗位类别】:\n${item.roles_summary}\n\n【招考核心条件与报考政策】:\n${item.announcement_text || '暂无更多详情文本'}`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  openParseModal() {
    const modal = document.getElementById('modal-parse-public-article');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.getElementById('public-article-text').value = '';
      document.getElementById('public-article-url').value = '';
    }
  },

  closeParseModal() {
    const modal = document.getElementById('modal-parse-public-article');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async submitParseArticle() {
    const text = document.getElementById('public-article-text').value.trim();
    const url = document.getElementById('public-article-url').value.trim();

    if (!text || text.length < 20) {
      App.showToast("请粘贴完整的招考推文或通告正文（至少20字）", "warning");
      return;
    }

    const parseBtn = document.getElementById('btn-do-public-parse');
    const originalText = parseBtn.innerHTML;
    parseBtn.disabled = true;
    parseBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>AI 正在结构化提取中...</span>`;
    lucide.createIcons();

    try {
      const res = await API.parsePublicRecruitArticle(text, url);
      App.showToast(res.message, "success");
      this.closeParseModal();
      await this.loadData();
    } catch (e) {
      App.showToast("提取失败: " + e.message, "error");
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  }
};
