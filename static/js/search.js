// Online Job Search & Aggregator Logic
const JobSearch = {
  currentSource: 'all',

  init() {
    this.setupEventListeners();
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
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.performSearch();
      });
    }
    if (parseUrlBtn) {
      parseUrlBtn.addEventListener('click', () => this.handleUrlParse());
    }
  },

  setSourceFilter(source) {
    this.currentSource = source;
    // Update tab active states
    document.querySelectorAll('.source-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-source') === source) {
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-400');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-800', 'text-slate-400');
      }
    });
    this.performSearch();
  },

  setQuickTag(tag) {
    const input = document.getElementById('search-job-input');
    if (input) {
      input.value = tag;
      this.performSearch();
    }
  },

  async performSearch() {
    const container = document.getElementById('search-results-list');
    const statusText = document.getElementById('search-status-text');
    const input = document.getElementById('search-job-input');
    const keyword = input ? input.value.trim() : '';

    if (!container) return;

    container.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-sm">正在实时检索全网开放岗位 (V2EX / RemoteOK)...</p>
      </div>
    `;

    try {
      const results = await API.searchJobs(keyword, this.currentSource);
      if (statusText) {
        statusText.innerText = `找到 ${results.length} 个相关职位`;
      }

      if (results.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center text-slate-400">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 text-slate-600"></i>
            <p class="text-base font-medium">暂未检索到相关岗位</p>
            <p class="text-xs text-slate-500 mt-1">可以尝试更换关键词（如 Python、全栈、Remote）或切换数据源</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = results.map((item, index) => {
        const jdSnippet = (item.jd_text || '').slice(0, 160).replace(/\n/g, ' ');
        return `
          <div class="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <!-- Header -->
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 class="font-bold text-base text-slate-100 line-clamp-1 hover:text-blue-400 cursor-pointer" onclick="JobSearch.previewJd(${index})">
                    ${Kanban.escapeHtml(item.title)}
                  </h4>
                  <div class="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span class="font-medium text-slate-300">${Kanban.escapeHtml(item.company)}</span>
                    <span>•</span>
                    <span>${Kanban.escapeHtml(item.location)}</span>
                  </div>
                </div>
                <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                  ${Kanban.escapeHtml(item.salary)}
                </span>
              </div>

              <!-- Source & Tags -->
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  ${Kanban.escapeHtml(item.source)}
                </span>
                ${(item.tags || '').split(',').filter(t => t.trim()).slice(0, 3).map(t => `
                  <span class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">${Kanban.escapeHtml(t)}</span>
                `).join('')}
              </div>

              <!-- Snippet -->
              <p class="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                ${Kanban.escapeHtml(jdSnippet)}...
              </p>
            </div>

            <!-- Footer Buttons -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <a href="${item.source_url}" target="_blank" class="text-slate-400 hover:text-blue-400 flex items-center gap-1">
                <span>查看原帖/链接</span>
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              </a>
              <button onclick="JobSearch.importJob(${index})" class="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                <span>一键导入看板</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Store in memory for import
      window._currentSearchResults = results;
      lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div class="col-span-full text-center py-12 text-rose-400">检索失败: ${e.message}</div>`;
    }
  },

  async importJob(index) {
    const item = window._currentSearchResults?.[index];
    if (!item) return;

    try {
      const newJob = await API.createJob({
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

      App.showToast(`已成功将「${item.company} - ${item.title}」导入到待投看板！`, 'success');
      App.refreshStats();
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
        // Open Create modal with pre-filled values
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
    const item = window._currentSearchResults?.[index];
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
