// Company Intelligence & Background Investigation Module (Job Copilot v4.2)
const CompanyManager = {
  currentProfile: null,
  currentJobTitle: '',

  init() {
    const searchInput = document.getElementById('company-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSearch();
        }
      });
    }

    // 初始加载精选标杆企业
    this.loadRecommended();
  },

  async loadRecommended() {
    try {
      const data = await API.searchCompanies('');
      this.renderCompanyCards(data.results || []);
    } catch (e) {
      console.error("加载企业推荐失败", e);
    }
  },

  async handleSearch(queryOverride = null) {
    const input = document.getElementById('company-search-input');
    const query = queryOverride !== null ? queryOverride : (input ? input.value.trim() : '');
    if (input && queryOverride !== null) input.value = queryOverride;

    const container = document.getElementById('company-results-grid');
    if (container) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs">正在穿透全网全景企业数据库进行企业背调与画像匹配...</span>
        </div>
      `;
    }

    try {
      const data = await API.searchCompanies(query);
      this.renderCompanyCards(data.results || []);
    } catch (e) {
      if (container) {
        container.innerHTML = `<div class="col-span-full py-12 text-center text-rose-500 text-xs">查询失败: ${e.message}</div>`;
      }
    }
  },

  renderCompanyCards(companies) {
    const container = document.getElementById('company-results-grid');
    if (!container) return;

    if (!companies || companies.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i data-lucide="building-2" class="w-10 h-10 text-slate-300 dark:text-slate-600"></i>
          <span class="text-xs">未找到匹配企业，您可在上方输入任意企业名称直接启动全网智能背调</span>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const wlbBadgeColors = {
      green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    };

    container.innerHTML = companies.map(c => {
      const badgeClass = wlbBadgeColors[c.wlb_badge] || wlbBadgeColors.yellow;
      return `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <!-- Header: Company Name & Type -->
            <div class="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <h4 class="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  ${this.escapeHtml(c.name)}
                </h4>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>${this.escapeHtml(c.headquarters || '全国')}</span>
                  <span>•</span>
                  <span>${this.escapeHtml(c.scale || '规模保密')}</span>
                </div>
              </div>
              <span class="text-[11px] px-2.5 py-1 rounded-full border ${badgeClass} font-medium flex-shrink-0">
                ${this.escapeHtml(c.wlb_level || '常规')}
              </span>
            </div>

            <!-- Industry & Category Tag -->
            <div class="flex flex-wrap gap-1.5 mb-3">
              ${c.is_live_searched ? `
                <span class="text-[11px] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-semibold flex items-center gap-1">
                  <i data-lucide="globe" class="w-3 h-3"></i>
                  <span>全网实时穿透生成</span>
                </span>
              ` : ''}
              <span class="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-medium">
                ${this.escapeHtml(c.company_type || '名企')}
              </span>
              <span class="text-[11px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                ${this.escapeHtml(c.industry || '综合')}
              </span>
            </div>

            <!-- WLB & Hours -->
            <div class="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mb-3">
              <div class="flex items-start gap-1.5">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5"></i>
                <span class="line-clamp-2 leading-relaxed font-normal">${this.escapeHtml(c.work_hours || '标准工时排休')}</span>
              </div>
              <div class="flex items-start gap-1.5">
                <i data-lucide="wallet" class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5"></i>
                <span class="line-clamp-2 leading-relaxed font-normal">${this.escapeHtml(c.salary_benefits || '规范五险一金')}</span>
              </div>
            </div>

            <!-- Interview / Highlights Snippet -->
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
              🎯 <strong>面试考察:</strong> ${this.escapeHtml(c.interview_style || '综合技术与业务素养面试')}
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <button data-company="${this.escapeHtml(c.name)}" onclick="CompanyManager.openProfileModal(this.dataset.company)" class="flex-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs">
              <i data-lucide="file-search" class="w-3.5 h-3.5"></i>
              <span>查看企业全景档案</span>
            </button>
            <a href="https://www.tianyancha.com/search?key=${encodeURIComponent(c.name)}" target="_blank" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors" title="天眼查工商与风险穿透">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-blue-500"></i>
            </a>
            <a href="https://maimai.cn/search/company?keyword=${encodeURIComponent(c.name)}" target="_blank" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors" title="脉脉真实职场爆料与同事圈">
              <i data-lucide="message-circle" class="w-3.5 h-3.5 text-indigo-500"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  },

  // ====================== 通用全景企业背调弹窗 ======================
  async openProfileModal(companyName, jobTitle = '') {
    if (!companyName) return;
    this.currentJobTitle = jobTitle;
    const modal = document.getElementById('company-profile-modal');
    if (!modal) return;

    // 清空重置
    document.getElementById('modal-company-title').innerText = '正在调取档案: ' + companyName;
    document.getElementById('modal-company-body').innerHTML = `
      <div class="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs">正在调取【${this.escapeHtml(companyName)}】全维度工商、薪酬、加班与面试情报...</span>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();

    try {
      const profile = await API.getCompanyProfile(companyName);
      this.currentProfile = profile;
      this.renderModalContent(profile, jobTitle);
    } catch (e) {
      document.getElementById('modal-company-body').innerHTML = `
        <div class="p-8 text-center text-rose-500 text-xs">加载失败: ${e.message}</div>
      `;
    }
  },

  renderModalContent(p, jobTitle = '') {
    const container = document.getElementById('modal-company-body');
    if (!container) return;

    document.getElementById('modal-company-title').innerText = p.name;

    const wlbBadgeColors = {
      green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      red: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };
    const badgeClass = wlbBadgeColors[p.wlb_badge] || wlbBadgeColors.yellow;

    const encodedName = encodeURIComponent(p.name);
    const cleanSearchName = encodeURIComponent(p.name.replace(/[\(（].*?[\)）]/g, '').trim());

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner & Core Stats -->
        <div class="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-2xl p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg font-semibold">
                ${this.escapeHtml(p.company_type || '企业单位')}
              </span>
              <span class="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg">
                ${this.escapeHtml(p.industry || '科技高新')}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400">WLB指数:</span>
              <span class="text-xs px-3 py-1 rounded-lg border ${badgeClass} font-bold flex items-center gap-1.5">
                <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                <span>${this.escapeHtml(p.wlb_level || '常规')}</span>
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5 text-[11px]">人员规模</span>
              <span class="font-bold text-slate-200">${this.escapeHtml(p.scale || '1000+ 人')}</span>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5 text-[11px]">总部城市</span>
              <span class="font-bold text-slate-200">${this.escapeHtml(p.headquarters || '全国')}</span>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5 text-[11px]">创立时间</span>
              <span class="font-bold text-slate-200">${p.founded_year ? p.founded_year + ' 年' : '知名品牌'}</span>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span class="text-slate-400 block mb-0.5 text-[11px]">官方主页</span>
              <a href="${p.website || '#'}" target="_blank" class="font-bold text-blue-400 hover:underline truncate block">访问官方网址 ↗</a>
            </div>
          </div>
        </div>

        <!-- 4-Block Dossier Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Card 1: WLB & Work Schedule -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2">
            <h5 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4"></i>
              <span>工时规范与考勤节奏 (WLB)</span>
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(p.work_hours || '标准双休，节假日按法定排休')}</p>
          </div>

          <!-- Card 2: Salary & Benefits -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2">
            <h5 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="coins" class="w-4 h-4"></i>
              <span>薪资待遇、年终奖与福利</span>
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(p.salary_benefits || '规范五险一金，提供绩效与年终激励')}</p>
          </div>

          <!-- Card 3: Interview Insights -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2">
            <h5 class="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="target" class="w-4 h-4"></i>
              <span>面试流程风格与高频考查偏好</span>
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(p.interview_style || '通常 2-3 轮综合面试')}</p>
          </div>

          <!-- Card 4: Risks & Warnings -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 space-y-2">
            <h5 class="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="shield-alert" class="w-4 h-4"></i>
              <span>避坑提示与风控防范</span>
            </h5>
            <p class="text-xs text-slate-300 leading-relaxed">${this.escapeHtml(p.risk_tips || '建议接 Offer 前仔细审阅劳动合同细则')}</p>
          </div>
        </div>

        <!-- Toolkit: External Deep Dive Links -->
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <i data-lucide="external-link" class="w-4 h-4 text-indigo-400"></i>
              <span>一键权威全网背调工具箱 (点击直接穿透真实数据)</span>
            </h5>
            <span class="text-[11px] text-slate-500">支持新窗口免登录直接穿透查询</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <!-- 天眼查 -->
            <a href="https://www.tianyancha.com/search?key=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">天</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-blue-400">天眼查</span>
                <span class="text-[10px] text-slate-400">查工商与官司</span>
              </div>
            </a>

            <!-- 爱企查 -->
            <a href="https://aiqicha.baidu.com/s?q=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">爱</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-indigo-400">爱企查</span>
                <span class="text-[10px] text-slate-400">查股东与股权</span>
              </div>
            </a>

            <!-- 企查查 -->
            <a href="https://www.qcc.com/web/search?key=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">企</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-sky-400">企查查</span>
                <span class="text-[10px] text-slate-400">查经营风险</span>
              </div>
            </a>

            <!-- 看准网 -->
            <a href="https://www.kanzhun.com/comp/search/?q=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">准</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-emerald-400">看准网</span>
                <span class="text-[10px] text-slate-400">查真实员工薪资</span>
              </div>
            </a>

            <!-- 职友集 -->
            <a href="https://www.jobui.com/cmp?q=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">集</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-teal-400">职友集</span>
                <span class="text-[10px] text-slate-400">查各地薪酬分布</span>
              </div>
            </a>

            <!-- 脉脉 -->
            <a href="https://maimai.cn/search/company?keyword=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">脉</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-indigo-400">脉脉同事圈</span>
                <span class="text-[10px] text-slate-400">查职场内部爆料</span>
              </div>
            </a>

            <!-- 牛客网 -->
            <a href="https://www.nowcoder.com/search?type=discuss&query=${cleanSearchName}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">牛</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-amber-400">牛客网</span>
                <span class="text-[10px] text-slate-400">查面经与笔试真题</span>
              </div>
            </a>

            <!-- 知乎 -->
            <a href="https://www.zhihu.com/search?type=content&q=${encodeURIComponent(cleanSearchName + ' 工作体验')}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">知</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-blue-400">知乎讨论</span>
                <span class="text-[10px] text-slate-400">在某某工作体验</span>
              </div>
            </a>

            <!-- 小红书 -->
            <a href="https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(cleanSearchName + ' 求职避坑')}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">红</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-rose-400">小红书</span>
                <span class="text-[10px] text-slate-400">求职环境避坑</span>
              </div>
            </a>

            <!-- 百度搜索 -->
            <a href="https://www.baidu.com/s?wd=${encodeURIComponent(cleanSearchName + ' 怎么样 招聘')}" target="_blank" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center gap-2 group">
              <span class="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-xs">百</span>
              <div>
                <span class="text-xs font-semibold text-slate-200 block group-hover:text-blue-400">百度全网</span>
                <span class="text-[10px] text-slate-400">新闻与舆情搜索</span>
              </div>
            </a>
          </div>
        </div>

        <!-- AI Deep Research Area -->
        <div class="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <i data-lucide="bot" class="w-4 h-4"></i>
              </div>
              <div>
                <h5 class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>AI 大模型深度商业背调与求职报告</span>
                  <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">深度洞察</span>
                </h5>
                <p class="text-[11px] text-slate-400">调用通用大模型深度剖析该企业护城河、部门核心度与薪酬谈判策略</p>
              </div>
            </div>

            <button id="btn-run-ai-research" onclick="CompanyManager.triggerAIResearch()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>生成 AI 深度背调报告</span>
            </button>
          </div>

          <div id="ai-research-report-box" class="hidden bg-slate-950/80 border border-indigo-500/20 rounded-xl p-5 text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
            <!-- Injected dynamically -->
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  async triggerAIResearch(companyName, jobTitle = '') {
    const targetCompany = companyName || this.currentProfile?.name || '';
    const targetJob = jobTitle || this.currentJobTitle || '';
    if (!targetCompany) return;

    const btn = document.getElementById('btn-run-ai-research');
    const box = document.getElementById('ai-research-report-box');
    if (!box) return;

    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="py-8 text-center text-indigo-300 flex flex-col items-center justify-center gap-2.5">
        <div class="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs">AI 顾问正在研判【${this.escapeHtml(targetCompany)}】的商业模式、部门结构、薪资机制与面试考察偏好...</span>
      </div>
    `;

    if (btn) btn.disabled = true;

    try {
      const res = await API.runAICompanyResearch(targetCompany, targetJob);
      if (res.report) {
        box.innerHTML = this.renderMarkdown(res.report);
      } else {
        box.innerHTML = `<div class="text-rose-400">生成失败，请重试。</div>`;
      }
    } catch (e) {
      box.innerHTML = `<div class="text-rose-400">请求异常: ${e.message}</div>`;
    } finally {
      if (btn) btn.disabled = false;
      lucide.createIcons();
    }
  },

  // 针对岗位详情弹窗第 4 个 Tab 的嵌入式呈现
  async renderDossierInDetailModal(containerId, companyName, jobTitle = '') {
    const container = document.getElementById(containerId);
    if (!container || !companyName) return;

    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div class="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs">正在加载【${this.escapeHtml(companyName)}】全景背调档案...</span>
      </div>
    `;

    try {
      const p = await API.getCompanyProfile(companyName);
      const cleanSearchName = encodeURIComponent(p.name.replace(/\(.*?\)/g, '').trim());
      const wlbBadgeColors = {
        green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        red: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      };
      const badgeClass = wlbBadgeColors[p.wlb_badge] || wlbBadgeColors.yellow;

      container.innerHTML = `
        <div class="space-y-4">
          <!-- Quick Header -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-sm text-slate-100">${this.escapeHtml(p.name)}</h4>
                <span class="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">${this.escapeHtml(p.company_type)}</span>
              </div>
              <p class="text-xs text-slate-400 mt-1">${this.escapeHtml(p.industry)} • 总部 ${this.escapeHtml(p.headquarters)} • 规模 ${this.escapeHtml(p.scale)}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-1 rounded-lg border ${badgeClass} font-semibold">
                ${this.escapeHtml(p.wlb_level)}
              </span>
              <button data-company="${this.escapeHtml(p.name)}" data-title="${this.escapeHtml(jobTitle)}" onclick="CompanyManager.openProfileModal(this.dataset.company, this.dataset.title)" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition-all">
                <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                <span>全屏背调视图</span>
              </button>
            </div>
          </div>

          <!-- 3 Columns Snapshot -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-amber-400 block mb-1">⏱️ 考勤工时与 WLB:</span>
              <p class="text-slate-300 leading-relaxed">${this.escapeHtml(p.work_hours)}</p>
            </div>
            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-emerald-400 block mb-1">💰 薪资年终与公积金:</span>
              <p class="text-slate-300 leading-relaxed">${this.escapeHtml(p.salary_benefits)}</p>
            </div>
            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <span class="font-bold text-blue-400 block mb-1">🎯 面试考察偏好:</span>
              <p class="text-slate-300 leading-relaxed">${this.escapeHtml(p.interview_style)}</p>
            </div>
          </div>

          <!-- Direct External Links Capsule Bar -->
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <i data-lucide="search" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>快捷背调直达:</span>
            </span>
            <a href="https://www.tianyancha.com/search?key=${cleanSearchName}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-700 px-2.5 py-1 rounded-lg">天眼查</a>
            <a href="https://aiqicha.baidu.com/s?q=${cleanSearchName}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-700 px-2.5 py-1 rounded-lg">爱企查</a>
            <a href="https://www.kanzhun.com/comp/search/?q=${cleanSearchName}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded-lg">看准员工薪酬</a>
            <a href="https://maimai.cn/search/company?keyword=${cleanSearchName}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 px-2.5 py-1 rounded-lg">脉脉同事圈</a>
            <a href="https://www.nowcoder.com/search?type=discuss&query=${cleanSearchName}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 px-2.5 py-1 rounded-lg">牛客面经</a>
            <a href="https://www.zhihu.com/search?type=content&q=${encodeURIComponent(cleanSearchName + ' 工作体验')}" target="_blank" class="text-xs bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 px-2.5 py-1 rounded-lg">知乎评价</a>
          </div>
        </div>
      `;
      lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div class="text-xs text-rose-400 p-4">加载企业画像失败: ${e.message}</div>`;
    }
  },

  renderMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-indigo-300 mt-4 mb-2 pb-1 border-b border-indigo-500/20">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-100 mt-5 mb-2 pb-1 border-b border-slate-800">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-100">$1</strong>')
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 leading-relaxed">$1</li>')
      .replace(/\n\n/gim, '<div class="h-2"></div>');
    return html;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
