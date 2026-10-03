// Online Multi-Channel Job Search & Domestic Clinical/General Aggregator Logic
const JobSearch = {
  currentSource: 'all',
  currentResults: [],

  init() {
    this.setupEventListeners();
    this.updateDirectPortals('');
    this.performSearch();
  },

  setupEventListeners() {
    const searchBtn = document.getElementById('btn-do-search');
    const searchInput = document.getElementById('search-job-input');
    const parseUrlBtn = document.getElementById('btn-parse-url');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.performSearch());
    }
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch();
        }
      });
      searchInput.addEventListener('input', (e) => {
        this.updateDirectPortals(e.target.value.trim());
      });
    }
    if (parseUrlBtn) {
      parseUrlBtn.addEventListener('click', () => this.handleUrlParse());
    }

    const searchSalaryFilter = document.getElementById('search-salary-filter');
    const searchTimeFilter = document.getElementById('search-time-filter');
    const searchSortFilter = document.getElementById('search-sort-filter');

    if (searchSalaryFilter) searchSalaryFilter.addEventListener('change', () => this.renderResults());
    if (searchTimeFilter) searchTimeFilter.addEventListener('change', () => this.renderResults());
    if (searchSortFilter) searchSortFilter.addEventListener('change', () => this.renderResults());
  },

  updateDirectPortals(kw) {
    const term = kw || '临床';
    const encoded = encodeURIComponent(term);

    const dxyBtn = document.getElementById('portal-dxy');
    const bossBtn = document.getElementById('portal-boss');
    const liepinBtn = document.getElementById('portal-liepin');
    const gaoxiaoBtn = document.getElementById('portal-gaoxiao');
    const job51Btn = document.getElementById('portal-51job');

    if (dxyBtn) dxyBtn.href = `https://www.jobmd.cn/work/search?keyword=${encoded}`;
    if (bossBtn) bossBtn.href = `https://www.zhipin.com/web/geek/job?query=${encoded}`;
    if (liepinBtn) liepinBtn.href = `https://www.liepin.com/zhaopin/?key=${encoded}`;
    if (gaoxiaoBtn) gaoxiaoBtn.href = `https://www.gaoxiaojob.com/zhaopin/yixue/`;
    if (job51Btn) job51Btn.href = `https://we.51job.com/pc/search?keyword=${encoded}`;
  },

  setSourceFilter(source) {
    this.currentSource = source;
    document.querySelectorAll('.source-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-source') === source) {
        btn.classList.add('bg-blue-600', 'text-white', 'shadow');
        btn.classList.remove('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow');
        btn.classList.add('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
      }
    });
    this.performSearch();
  },

  setQuickTag(tag) {
    const input = document.getElementById('search-job-input');
    if (input) {
      input.value = tag;
      this.updateDirectPortals(tag);
      this.performSearch();
    }
  },

  async performSearch() {
    const container = document.getElementById('search-results-list');
    const countBadge = document.getElementById('search-count-badge');
    const input = document.getElementById('search-job-input');
    const keyword = input ? input.value.trim() : '';

    this.updateDirectPortals(keyword);

    if (!container) return;

    container.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
        <div class="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-sm font-semibold text-slate-200">正在异步并发检索各大开放招聘数据源...</p>
        <p class="text-xs text-slate-500 mt-1">覆盖 阮一峰《谁在招人》开源专栏、V2EX 酷工作、Arbeitnow、Jobicy、Remotive、RemoteOK 等</p>
      </div>
    `;

    try {
      const results = await API.searchJobs(keyword, this.currentSource);
      this.currentResults = Array.isArray(results) ? results : [];

      if (countBadge) {
        countBadge.innerText = `共实时检索到 ${this.currentResults.length} 个职位`;
      }

      if (this.currentResults.length === 0) {
        const isMedical = /临床|医学|医生|药|生化|生物|护士|CRA|CRC|医院/i.test(keyword);
        const encodedKw = encodeURIComponent(keyword || '临床');

        container.innerHTML = `
          <div class="col-span-full py-10 px-6 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm">
            <div class="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <i data-lucide="${isMedical ? 'stethoscope' : 'search-x'}" class="w-7 h-7"></i>
            </div>
            
            <div class="max-w-xl mx-auto space-y-2">
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                ${isMedical ? `未在开放技术社区中找到「${keyword}」岗位` : `暂未检索到相关职位`}
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ${isMedical 
                  ? `💡 <strong>原因说明</strong>：当前内置的开放 API（V2EX、阮一峰开源周刊等）主要以<strong>互联网开发 / IT 架构 / 远程编程</strong>为主，临床医学、三甲医院、医药 CRO 等岗位几乎不在技术论坛发帖。`
                  : `建议尝试更换关键词（如 临床、CRC、Python、Java、全栈、Go、Remote、管培生、财务）或切换招聘渠道。`
                }
              </p>
            </div>

            <!-- Medical / General Direct Search Recommendations -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 max-w-2xl mx-auto text-left">
              <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-2.5 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-4 h-4 text-indigo-500 dark:text-indigo-400"></i>
                <span>推荐通过【国内临床/全行业招聘直通车】直接检索，并使用插件一键采集：</span>
              </p>
              
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <a href="https://www.jobmd.cn/work/search?keyword=${encodedKw}" target="_blank" class="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-xl transition-all flex flex-col justify-between text-xs group shadow-xs">
                  <div class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-between">
                    <span>🏥 丁香人才网</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60"></i>
                  </div>
                  <span class="text-[10px] text-slate-500 mt-1">国内最大临床医药招聘</span>
                </a>

                <a href="https://www.zhipin.com/web/geek/job?query=${encodedKw}" target="_blank" class="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 rounded-xl transition-all flex flex-col justify-between text-xs group shadow-xs">
                  <div class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center justify-between">
                    <span>💼 Boss直聘</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60"></i>
                  </div>
                  <span class="text-[10px] text-slate-500 mt-1">医院/药企/临床直聘</span>
                </a>

                <a href="https://www.liepin.com/zhaopin/?key=${encodedKw}" target="_blank" class="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 rounded-xl transition-all flex flex-col justify-between text-xs group shadow-xs">
                  <div class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-between">
                    <span>🎯 猎聘网</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60"></i>
                  </div>
                  <span class="text-[10px] text-slate-500 mt-1">中高端医学/CRA/研发</span>
                </a>

                <a href="https://www.gaoxiaojob.com/zhaopin/yixue/" target="_blank" class="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-xl transition-all flex flex-col justify-between text-xs group shadow-xs">
                  <div class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-between">
                    <span>🏢 高校人才网</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5 opacity-60"></i>
                  </div>
                  <span class="text-[10px] text-slate-500 mt-1">全国公立三甲医院直招</span>
                </a>
              </div>

              <div class="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2 text-indigo-900 dark:text-slate-300">
                  <i data-lucide="puzzle" class="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0"></i>
                  <span>提示：打开上述网站搜索到心仪职位后，点击浏览器右上角 <strong>Job Copilot 插件</strong> 即可一键秒录入本地看板！</span>
                </div>
              </div>
            </div>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      this.renderResults();
    } catch (e) {
      if (container) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-rose-500 font-semibold text-xs">搜索失败: ${e.message}</div>`;
      }
    }
  },

  resetFilters() {
    const salaryFilter = document.getElementById('search-salary-filter');
    const timeFilter = document.getElementById('search-time-filter');
    const sortFilter = document.getElementById('search-sort-filter');
    if (salaryFilter) salaryFilter.value = 'all';
    if (timeFilter) timeFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'relevance';
    this.renderResults();
  },

  renderResults() {
    const container = document.getElementById('search-results-list');
    const countBadge = document.getElementById('search-count-badge');
    const salaryFilter = document.getElementById('search-salary-filter')?.value || 'all';
    const timeFilter = document.getElementById('search-time-filter')?.value || 'all';
    const sortFilter = document.getElementById('search-sort-filter')?.value || 'relevance';

    if (!container) return;

    let filtered = [...this.currentResults];

    // Helper to parse salary (e.g. "20k-30k" -> 25)
    const parseSalary = (salaryStr) => {
      if (!salaryStr) return 0;
      const matches = String(salaryStr).match(/\d+/g);
      if (!matches) return 0;
      const nums = matches.map(Number);
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      if (String(salaryStr).toLowerCase().includes('k')) return avg * 1000;
      if (String(salaryStr).includes('万')) return avg * 10000;
      return avg;
    };

    // Safe helper to parse dates across string / unix seconds / iso
    const parseJobDate = (raw) => {
      if (!raw) return null;
      if (typeof raw === 'number') {
        const ms = raw < 10000000000 ? raw * 1000 : raw;
        return new Date(ms);
      }
      const str = String(raw).trim();
      const num = Number(str);
      if (!isNaN(num) && num > 100000000) {
        const ms = num < 10000000000 ? num * 1000 : num;
        return new Date(ms);
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };

    // Safe helper to format date for display
    const formatDisplayDate = (raw) => {
      if (!raw) return '';
      const str = String(raw).trim();
      if (str.includes('T')) return str.split('T')[0];
      if (str.includes(' ')) return str.split(' ')[0];
      return str.slice(0, 10);
    };

    // Filter by salary
    if (salaryFilter !== 'all') {
      filtered = filtered.filter(job => {
        const s = parseSalary(job.salary);
        if (salaryFilter === 'high') return s >= 20000;
        if (salaryFilter === 'medium') return s >= 10000 && s < 20000;
        return true;
      });
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(job => {
        const jobDate = parseJobDate(job.created_at);
        if (!jobDate) return true; // 日期未标注的条目保留
        const diffDays = (now - jobDate) / (1000 * 60 * 60 * 24);
        if (timeFilter === 'today') return diffDays <= 1.5;
        if (timeFilter === 'week') return diffDays <= 7.5;
        if (timeFilter === 'month') return diffDays <= 30.5;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortFilter === 'salary_desc') {
        return parseSalary(b.salary) - parseSalary(a.salary);
      } else if (sortFilter === 'latest') {
        const da = parseJobDate(a.created_at) || new Date(0);
        const db = parseJobDate(b.created_at) || new Date(0);
        return db - da;
      }
      return 0; // relevance or default
    });

    if (countBadge && this.currentResults.length > 0) {
      countBadge.innerText = filtered.length === this.currentResults.length
        ? `共实时检索到 ${filtered.length} 个职位`
        : `已筛选出 ${filtered.length} 个职位 (共 ${this.currentResults.length} 个)`;
    }

    // 如果筛选后无任何结果，展示友好的重置提示
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 px-6 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <i data-lucide="filter-x" class="w-6 h-6"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">没有符合当前高级筛选条件的职位</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">请尝试调整薪资门槛或放宽发布时间范围</p>
          <button onclick="JobSearch.resetFilters()" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all active:scale-95">重置筛选条件</button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map((item) => {
      const index = this.currentResults.indexOf(item);
      const jdSnippet = (item.jd_text || '').slice(0, 160).replace(/\n/g, ' ');
      const isDomestic = (item.source || '').includes('阮一峰') || (item.source || '').includes('V2EX') || (item.source || '').includes('直招') || (item.source || '').includes('专区');
      const displayDate = formatDisplayDate(item.created_at);

      return `
        <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onclick="JobSearch.previewJd(${index})">
                  ${Kanban.escapeHtml(item.title)}
                </h4>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span class="font-semibold text-slate-700 dark:text-slate-200 truncate">${Kanban.escapeHtml(item.company)}</span>
                  <button type="button" data-company="${Kanban.escapeHtml(item.company)}" data-title="${Kanban.escapeHtml(item.title)}" onclick="event.stopPropagation(); CompanyManager.openProfileModal(this.dataset.company, this.dataset.title)" class="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 transition-colors" title="一键企业背调与职场口碑">
                    <i data-lucide="building-2" class="w-2.5 h-2.5"></i>
                    <span>查企业</span>
                  </button>
                  <span>•</span>
                  <span class="text-slate-500 dark:text-slate-400 truncate">📍 ${Kanban.escapeHtml(item.location)}</span>
                </div>
              </div>
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap font-mono flex-shrink-0">
                ${Kanban.escapeHtml(item.salary)}
              </span>
            </div>

            <!-- Source & Tags -->
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span class="text-[11px] font-medium ${isDomestic ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'} px-2 py-0.5 rounded border">
                ${Kanban.escapeHtml(item.source)}
              </span>
              ${(item.tags || '').split(',').filter(t => t.trim()).slice(0, 3).map(t => `
                <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">${Kanban.escapeHtml(t.trim())}</span>
              `).join('')}
              ${displayDate ? `<span class="text-[10px] text-slate-400 dark:text-slate-500 ml-auto font-mono">📅 ${displayDate}</span>` : ''}
            </div>

            <!-- Snippet -->
            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/60 font-mono">
              ${Kanban.escapeHtml(jdSnippet)}...
            </p>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <a href="${item.source_url}" target="_blank" class="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1">
              <span>查看原招聘帖</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
            <button onclick="JobSearch.importJob(${index})" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm active:scale-95">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>一键导入看板</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  },

      lucide.createIcons();
  },

  async importJob(index) {
    const item = this.currentResults[index];
    if (!item) return;

    try {
      await API.createJob({
        title: item.title,
        company: item.company,
        location: item.location,
        salary: item.salary,
        status: 'wishlist',
        source: item.source,
        source_url: item.source_url,
        jd_text: item.jd_text,
        tags: item.tags,
        priority: 2,
        resume_version: '默认通用简历'
      });

      App.showToast(`🎉 已成功将「${item.company} - ${item.title}」导入到待投看板！`, 'success');
      App.refreshStats();
      if (window.Kanban && typeof Kanban.loadAndRenderJobs === 'function') {
        Kanban.loadAndRenderJobs();
      }
    } catch (e) {
      App.showToast('导入失败: ' + e.message, 'error');
    }
  },

  async handleUrlParse() {
    const input = document.getElementById('parse-url-input');
    const url = input ? input.value.trim() : '';
    if (!url) {
      App.showToast('请输入目标岗位网页 URL', 'warning');
      return;
    }

    const btn = document.getElementById('btn-parse-url');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 抓取中...`;

    try {
      const res = await API.parseUrl(url);
      if (res.success) {
        App.openCreateJobModal('wishlist', {
          title: res.title || '抓取的岗位',
          source_url: res.source_url,
          jd_text: res.jd_text,
          source: '网页快照抓取'
        });
        App.showToast('已成功提取网页 JD 快照！请完善公司与薪资信息后保存。', 'success');
        input.value = '';
      } else {
        App.showToast('抓取失败: ' + (res.error || '网页不支持直接解析'), 'error');
      }
    } catch (e) {
      App.showToast('请求异常: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
      lucide.createIcons();
    }
  },

  previewJd(index) {
    const item = this.currentResults[index];
    if (!item) return;

    const modal = document.getElementById('preview-jd-modal');
    const titleEl = document.getElementById('preview-jd-title');
    const textEl = document.getElementById('preview-jd-text');

    if (modal && titleEl && textEl) {
      titleEl.innerText = `${item.company} - ${item.title}`;
      textEl.innerText = item.jd_text || '暂无详细职责描述';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
};
