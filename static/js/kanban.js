// Kanban Board Logic (v4.4 with Viewport Adaptation & Wishlist Grouping)
const Kanban = {
  columns: [
    { id: 'wishlist', title: '意向待投', icon: 'bookmark', color: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400' },
    { id: 'applied', title: '已投递', icon: 'send', color: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { id: 'screening', title: '初筛 / 笔试', icon: 'file-text', color: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { id: 'interview', title: '面试中', icon: 'users', color: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    { id: 'offer', title: '已获 Offer', icon: 'award', color: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    { id: 'rejected', title: '未通过 / 归档', icon: 'archive', color: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400' }
  ],

  wishlistViewMode: 'grouped', // 'grouped' | 'flat'
  layoutMode: localStorage.getItem('jobcopilot_kanban_layout') || 'fit', // 'fit' (整屏自适应) | 'fixed' (320px宽卡片)
  sortableInstances: [],

  init() {
    this.updateLayoutToggleBtn();
    this.renderColumnsStructure();
    this.loadAndRenderJobs();
  },

  toggleLayoutMode() {
    this.layoutMode = this.layoutMode === 'fit' ? 'fixed' : 'fit';
    localStorage.setItem('jobcopilot_kanban_layout', this.layoutMode);
    this.updateLayoutToggleBtn();
    this.renderColumnsStructure();
    this.loadAndRenderJobs();
  },

  updateLayoutToggleBtn() {
    const btnText = document.getElementById('kanban-layout-text');
    const btn = document.getElementById('btn-kanban-layout');
    if (btnText) {
      btnText.textContent = this.layoutMode === 'fit' ? '整屏自适应' : '固定宽卡片';
    }
    if (btn) {
      btn.title = this.layoutMode === 'fit' 
        ? '当前: 整屏弹性自适应（点击切换为固定 320px 宽卡片）' 
        : '当前: 固定 320px 宽卡片（点击切换为整屏弹性自适应）';
      if (this.layoutMode === 'fit') {
        btn.classList.add('text-blue-600', 'dark:text-blue-400', 'bg-blue-50/50', 'dark:bg-blue-500/10');
      } else {
        btn.classList.remove('text-blue-600', 'dark:text-blue-400', 'bg-blue-50/50', 'dark:bg-blue-500/10');
      }
    }
  },

  toggleWishlistViewMode() {
    this.wishlistViewMode = this.wishlistViewMode === 'grouped' ? 'flat' : 'grouped';
    this.renderColumnsStructure();
    this.loadAndRenderJobs();
  },

  renderColumnsStructure() {
    const container = document.getElementById('kanban-container');
    if (!container) return;

    // 根据 layoutMode 决定列样式
    // fit 模式: flex-1 min-w-[220px] sm:min-w-[240px] 2xl:min-w-[260px] max-w-none，6 列自动填满屏幕无横向滚动
    // fixed 模式: flex-shrink-0 w-80，固定 320px 宽，按需横向平滑滚动
    const colWidthClass = this.layoutMode === 'fit'
      ? 'flex-1 min-w-[220px] sm:min-w-[240px] 2xl:min-w-[260px] max-w-none'
      : 'flex-shrink-0 w-80';

    container.innerHTML = this.columns.map(col => `
      <div class="flex flex-col ${colWidthClass} h-full min-h-0 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-all">
        <!-- Column Header -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-200/50 dark:bg-slate-900/80 flex-shrink-0">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full ${col.bg} border ${col.color} flex-shrink-0"></span>
            <h3 class="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">${col.title}</h3>
            <span id="count-${col.id}" class="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">0</span>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            ${col.id === 'wishlist' ? `
              <button onclick="Kanban.toggleWishlistViewMode()" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-all flex items-center gap-1" title="切换分组聚合 / 平铺模式">
                <i data-lucide="${this.wishlistViewMode === 'grouped' ? 'folder-kanban' : 'list'}" class="w-3 h-3 text-indigo-500"></i>
                <span>${this.wishlistViewMode === 'grouped' ? '分组' : '平铺'}</span>
              </button>
            ` : ''}

            <button onclick="App.openCreateJobModal('${col.id}')" class="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-300/60 dark:hover:bg-slate-800 p-1 rounded transition-colors" title="在此状态下新增岗位">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Cards Container (Takes 100% Remaining Height, Independent Scroll) -->
        <div id="col-${col.id}" data-status="${col.id}" class="kanban-column flex-1 min-h-0 p-2.5 space-y-2.5 overflow-y-auto">
          <!-- Job cards or grouped accordions injected here -->
        </div>
      </div>
    `).join('');

    lucide.createIcons();
    this.setupDragAndDrop();
  },

  setupDragAndDrop() {
    // 销毁旧的 Sortable 实例
    this.sortableInstances.forEach(s => {
      try { s.destroy(); } catch (e) {}
    });
    this.sortableInstances = [];

    const attachSortable = (el, defaultStatus) => {
      if (!el) return;
      const sortable = new Sortable(el, {
        group: 'job-kanban',
        draggable: '.job-card',
        animation: 180,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: async (evt) => {
          const jobId = evt.item.getAttribute('data-job-id');
          const toContainer = evt.to;
          const fromContainer = evt.from;
          const newStatus = toContainer.getAttribute('data-status') || toContainer.closest('[data-status]')?.getAttribute('data-status') || defaultStatus;
          const oldStatus = fromContainer.getAttribute('data-status') || fromContainer.closest('[data-status]')?.getAttribute('data-status');
          const targetGroup = toContainer.getAttribute('data-group');
          const oldGroup = fromContainer.getAttribute('data-group');

          if (newStatus !== oldStatus || (targetGroup && targetGroup !== oldGroup)) {
            try {
              const payload = { status: newStatus };
              if (targetGroup) {
                payload.job_group = targetGroup;
              }
              await API.updateJob(jobId, payload);
              App.showToast(`已更新为「${Kanban.getStatusName(newStatus)}」${targetGroup ? `（分组: ${targetGroup}）` : ''}`, 'success');
              Kanban.updateColumnCounts();
              App.refreshStats();
              Kanban.loadAndRenderJobs();
            } catch (err) {
              App.showToast('更新状态失败: ' + err.message, 'error');
              Kanban.loadAndRenderJobs();
            }
          }
        }
      });
      this.sortableInstances.push(sortable);
    };

    this.columns.forEach(col => {
      const colEl = document.getElementById(`col-${col.id}`);
      if (!colEl) return;

      if (col.id === 'wishlist' && this.wishlistViewMode === 'grouped') {
        // Also attach to each group body inside wishlist
        colEl.querySelectorAll('[id^="body-grp-"]').forEach(groupBody => {
          attachSortable(groupBody, 'wishlist');
        });
        attachSortable(colEl, 'wishlist');
      } else {
        attachSortable(colEl, col.id);
      }
    });
  },

  async loadAndRenderJobs() {
    try {
      const keyword = document.getElementById('search-filter')?.value || '';
      const source = document.getElementById('source-filter')?.value || '';
      const priority = document.getElementById('priority-filter')?.value || '';
      const groupFilter = document.getElementById('group-filter')?.value || 'all';
      const sortBy = document.getElementById('kanban-sort-filter')?.value || 'updated_desc';

      let jobs = await API.getJobs({
        keyword,
        source,
        group: groupFilter !== 'all' ? groupFilter : null
      });

      // Apply priority filter
      if (priority && priority !== 'all') {
        jobs = jobs.filter(j => String(j.priority) === priority);
      }

      // Helper to parse salary (e.g. "20k-30k" -> 25)
      const parseSalary = (salaryStr) => {
        if (!salaryStr) return 0;
        const matches = salaryStr.match(/\d+/g);
        if (!matches) return 0;
        const nums = matches.map(Number);
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        if (salaryStr.toLowerCase().includes('k')) return avg * 1000;
        if (salaryStr.includes('万')) return avg * 10000;
        return avg;
      };

      // Sort jobs with null safety
      jobs.sort((a, b) => {
        if (sortBy === 'priority_asc') {
          return (a.priority || 2) - (b.priority || 2);
        } else if (sortBy === 'salary_desc') {
          return parseSalary(b.salary) - parseSalary(a.salary);
        } else {
          const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          return bTime - aTime;
        }
      });

      // 清空各列
      this.columns.forEach(col => {
        const colEl = document.getElementById(`col-${col.id}`);
        if (colEl) colEl.innerHTML = '';
      });

      // Wishlist 列特殊处理：支持分组折叠聚合
      if (this.wishlistViewMode === 'grouped') {
        const wishlistCol = document.getElementById('col-wishlist');
        const wishlistJobs = jobs.filter(j => j.status === 'wishlist');
        const otherJobs = jobs.filter(j => j.status !== 'wishlist');

        if (wishlistCol) {
          if (wishlistJobs.length === 0) {
            wishlistCol.innerHTML = UI.empty({
              icon: 'bookmark',
              title: '暂无意向待投企业',
              hint: '点击下方按钮或从秋招情报站一键收录',
              action: { text: '+ 录入意向岗位', onclick: "App.openCreateJobModal('wishlist')" }
            });
          } else {
            // 按 job_group 聚合
            const groupMap = new Map();
            wishlistJobs.forEach(job => {
              const grp = (job.job_group || '默认未分组').trim();
              if (!groupMap.has(grp)) {
                groupMap.set(grp, []);
              }
              groupMap.get(grp).push(job);
            });

            let groupsHtml = '';
            groupMap.forEach((groupJobs, groupName) => {
              // 统计该组最常见简历版本
              const resCounts = {};
              groupJobs.forEach(j => {
                if (j.resume_version) {
                  resCounts[j.resume_version] = (resCounts[j.resume_version] || 0) + 1;
                }
              });
              const primaryResume = Object.entries(resCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '通用简历';
              const safeGrpId = 'grp-' + encodeURIComponent(groupName).replace(/%/g, '_');
              const cardsHtml = groupJobs.map(job => this.createJobCardHtml(job)).join('');

              groupsHtml += `
                <div class="wishlist-group-accordion bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs mb-3">
                  <!-- Group Header -->
                  <div class="p-2.5 bg-gradient-to-r from-slate-100/90 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none" onclick="Kanban.toggleGroupAccordion('${safeGrpId}')">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <i data-lucide="chevron-down" id="chevron-${safeGrpId}" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform"></i>
                      <i data-lucide="folder" class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"></i>
                      <span class="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title="${this.escapeHtml(groupName)}">${this.escapeHtml(groupName)}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">${groupJobs.length}</span>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onclick="event.stopPropagation(); App.openCreateJobModal('wishlist', { job_group: '${this.escapeHtml(groupName)}', resume_version: '${primaryResume !== '通用简历' ? this.escapeHtml(primaryResume) : ''}' })" class="text-[10px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1 rounded shadow-xs transition-all" title="在该赛道分组下录入新岗位">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                      </button>
                      <button type="button" onclick="event.stopPropagation(); Kanban.batchApplyGroup('${this.escapeHtml(groupName)}')" class="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-0.5 rounded shadow-xs flex items-center gap-0.5 transition-all active:scale-95" title="一键将该赛道所有意向岗位标记为已投递">
                        <i data-lucide="send" class="w-2.5 h-2.5"></i>
                        <span>一键投递</span>
                      </button>
                    </div>
                  </div>

                  <!-- Group Resume Mapping Subbar -->
                  <div class="px-2.5 py-1 bg-indigo-50/40 dark:bg-indigo-950/10 border-b border-indigo-100/50 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span class="flex items-center gap-1 truncate text-indigo-600 dark:text-indigo-400 font-medium">
                      <i data-lucide="file-check" class="w-3 h-3 text-indigo-500"></i>
                      <span class="truncate">专属简历: ${this.escapeHtml(primaryResume)}</span>
                    </span>
                    <span class="text-slate-500 dark:text-slate-500">${groupJobs.length} 家企业</span>
                  </div>

                  <!-- Group Cards Body (Sortable Droppable) -->
                  <div id="body-${safeGrpId}" data-status="wishlist" data-group="${this.escapeHtml(groupName)}" class="p-2 space-y-2 min-h-[40px]">
                    ${cardsHtml}
                  </div>
                </div>
              `;
            });
            wishlistCol.innerHTML = groupsHtml;
          }
        }

        // 填充其他非 wishlist 状态列（无卡片时展示垂直居中的轻量占位，卡片存在时展示卡片）
        this.columns.filter(c => c.id !== 'wishlist').forEach(col => {
          const colJobs = otherJobs.filter(j => j.status === col.id);
          const colEl = document.getElementById(`col-${col.id}`);
          if (!colEl) return;
          if (colJobs.length === 0) {
            colEl.innerHTML = `
              <div class="h-full min-h-[160px] flex flex-col items-center justify-center py-8 text-center text-slate-400/40 dark:text-slate-600 text-xs select-none pointer-events-none">
                <i data-lucide="${col.icon || 'inbox'}" class="w-6 h-6 mx-auto mb-1 opacity-25"></i>
                <p>暂无${col.title}企业</p>
              </div>
            `;
          } else {
            colJobs.forEach(job => {
              colEl.insertAdjacentHTML('beforeend', this.createJobCardHtml(job));
            });
          }
        });
      } else {
        // 平铺模式：各列直接平铺渲染
        this.columns.forEach(col => {
          const colJobs = jobs.filter(j => j.status === col.id);
          const colEl = document.getElementById(`col-${col.id}`);
          if (!colEl) return;
          if (colJobs.length === 0) {
            colEl.innerHTML = `
              <div class="h-full min-h-[160px] flex flex-col items-center justify-center py-8 text-center text-slate-400/40 dark:text-slate-600 text-xs select-none pointer-events-none">
                <i data-lucide="${col.icon || 'inbox'}" class="w-6 h-6 mx-auto mb-1 opacity-25"></i>
                <p>暂无${col.title}企业</p>
              </div>
            `;
          } else {
            colJobs.forEach(job => {
              colEl.insertAdjacentHTML('beforeend', this.createJobCardHtml(job));
            });
          }
        });
      }

      this.updateColumnCounts();
      this.setupDragAndDrop();
      lucide.createIcons();
    } catch (e) {
      console.error("加载岗位失败", e);
    }
  },

  createJobCardHtml(job) {
    const priorityColors = {
      1: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      2: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      3: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30'
    };
    const priorityLabels = { 1: '高优', 2: '中等', 3: '备选' };

    const tags = (job.tags || '').split(',').filter(t => t.trim()).slice(0, 3);
    const grpName = job.job_group || '默认未分组';

    return `
      <div data-job-id="${job.id}" data-group="${this.escapeHtml(grpName)}" onclick="App.openJobDetailModal(${job.id})" 
           class="job-card bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 rounded-lg p-3.5 cursor-pointer shadow-xs hover:shadow-md relative group transition-all">
        
        <!-- Header: Title & Priority -->
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <h4 class="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            ${this.escapeHtml(job.title)}
          </h4>
          <span class="text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[job.priority] || priorityColors[2]} flex-shrink-0 font-medium">
            ${priorityLabels[job.priority] || '中等'}
          </span>
        </div>

        <!-- Company & Location -->
        <div class="flex items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0"></i>
            <span class="font-medium text-slate-700 dark:text-slate-300 truncate">${this.escapeHtml(job.company)}</span>
            <span class="text-slate-500 dark:text-slate-600">•</span>
            <span class="text-slate-500 dark:text-slate-400 truncate">${this.escapeHtml(job.location || '不限')}</span>
          </div>
          <button type="button" data-company="${this.escapeHtml(job.company)}" data-title="${this.escapeHtml(job.title)}" onclick="event.stopPropagation(); CompanyManager.openProfileModal(this.dataset.company, this.dataset.title)" class="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 transition-colors flex-shrink-0" title="查看该企业全景背调与职场口碑">
            <i data-lucide="search" class="w-2.5 h-2.5"></i>
            <span>查企业</span>
          </button>
        </div>

        <!-- Group & Resume Tag Badges Row -->
        <div class="flex flex-wrap items-center gap-1.5 mb-2">
          <span class="inline-flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 font-medium max-w-full truncate" title="所属赛道分组: ${this.escapeHtml(grpName)}">
            <i data-lucide="folder" class="w-2.5 h-2.5 text-indigo-500 flex-shrink-0"></i>
            <span class="truncate max-w-[130px]">${this.escapeHtml(grpName)}</span>
          </span>

          ${job.resume_version ? `
            <span class="inline-flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 max-w-full truncate" title="投递简历版本: ${this.escapeHtml(job.resume_version)}">
              <i data-lucide="file-check" class="w-2.5 h-2.5 text-blue-500 flex-shrink-0"></i>
              <span class="truncate max-w-[120px]">${this.escapeHtml(job.resume_version)}</span>
            </span>
          ` : ''}
        </div>

        <!-- Salary & Source Badges -->
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
            ${this.escapeHtml(job.salary || '面议')}
          </span>
          <span class="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600/40">
            ${this.escapeHtml(job.source || '其他')}
          </span>
        </div>

        <!-- Tags -->
        ${tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-2">
            ${tags.map(t => `<span class="text-[10px] bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-transparent">${this.escapeHtml(t.trim())}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Footer: Updated Date & Actions -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <span>${job.applied_at ? `投于 ${job.applied_at}` : `更新于 ${(job.updated_at || '').split(' ')[0] || '近期'}`}</span>
          <div class="flex items-center gap-2">
            ${job.jd_text ? '<span title="已保存JD快照" class="text-blue-500 dark:text-blue-400"><i data-lucide="file-text" class="w-3.5 h-3.5"></i></span>' : ''}
            ${job.resume_key_points ? '<span title="已做针对性简历标注" class="text-amber-500 dark:text-amber-400"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i></span>' : ''}
          </div>
        </div>
      </div>
    `;
  },

  toggleGroupAccordion(safeGrpId) {
    const body = document.getElementById(`body-${safeGrpId}`);
    const chevron = document.getElementById(`chevron-${safeGrpId}`);
    if (!body) return;
    if (body.classList.contains('hidden')) {
      body.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    } else {
      body.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(-90deg)';
    }
  },

  async batchApplyGroup(groupName) {
    if (!groupName) return;
    const confirmed = await UI.confirm({
      title: '批量标记投递',
      message: `确定将分组「${groupName}」下的所有待投企业一键转入「已投递」吗？\n系统将自动记录今日投递时间并推进流程。`,
      confirmText: '一键标记已投'
    });
    if (!confirmed) return;

    try {
      App.showToast(`正在将「${groupName}」全员转为已投递...`, 'info');
      const res = await API.batchUpdateGroupStatus(groupName, 'wishlist', 'applied');
      App.showToast(`🚀 已成功将「${groupName}」下的 ${res.updated_count} 家企业转为「已投递」！`, 'success');
      await Kanban.loadAndRenderJobs();
      await App.refreshStats();
      await App.populateGroupFilterOptions();
    } catch (e) {
      App.showToast(`批量投递失败: ${e.message}`, 'error');
    }
  },

  async openGroupManagerModal() {
    const modal = document.getElementById('wishlist-group-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    await this.renderGroupManagerModalContent();
    lucide.createIcons();
  },

  async renderGroupManagerModalContent() {
    try {
      const summary = await API.getGroupsSummary();
      const groups = Array.isArray(summary) ? summary : (summary.groups || []);
      const banner = document.getElementById('group-manager-summary-banner');
      const cardsContainer = document.getElementById('group-manager-cards');
      const batchList = document.getElementById('batch-assign-jobs-list');

      const totalGroups = groups.length;
      const totalWishlist = groups.reduce((acc, g) => acc + (g.wishlist_count || 0), 0);
      const totalApplied = groups.reduce((acc, g) => acc + (g.applied_count || 0), 0);

      if (banner) {
        banner.innerHTML = `
          <div class="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 p-3.5 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <i data-lucide="folders" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-400">活跃赛道/分组数</div>
              <div class="text-lg font-bold text-slate-900 dark:text-slate-100">${totalGroups} 个赛道</div>
            </div>
          </div>
          <div class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <i data-lucide="bookmark" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-400">意向待投企业聚合</div>
              <div class="text-lg font-bold text-amber-600 dark:text-amber-400">${totalWishlist} 家待投</div>
            </div>
          </div>
          <div class="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-3.5 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <i data-lucide="send" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-400">已批量推进投递</div>
              <div class="text-lg font-bold text-blue-600 dark:text-blue-400">${totalApplied} 家已投</div>
            </div>
          </div>
        `;
      }

      if (cardsContainer) {
        if (groups.length === 0) {
          cardsContainer.innerHTML = `
            <div class="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
              暂无赛道分组数据，可在新增岗位或详情中指定分组
            </div>
          `;
        } else {
          cardsContainer.innerHTML = groups.map(g => `
            <div class="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-3 min-w-[200px]">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <i data-lucide="folder" class="w-4 h-4"></i>
                </div>
                <div>
                  <h5 class="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>${this.escapeHtml(g.group_name)}</span>
                    <span class="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-normal">共 ${g.total_jobs} 家</span>
                  </h5>
                  <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <i data-lucide="file-text" class="w-3 h-3"></i>
                      <span>关联简历: ${this.escapeHtml(g.primary_resume || '默认简历')}</span>
                    </span>
                    <span>•</span>
                    <span>待投: <b class="text-amber-500">${g.wishlist_count}</b></span>
                    <span>已投: <b class="text-blue-500">${g.applied_count}</b></span>
                    <span>笔面: <b class="text-purple-500">${g.interview_count}</b></span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="Kanban.filterBySpecificGroup('${this.escapeHtml(g.group_name)}')" class="px-2.5 py-1.5 rounded-lg text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1" title="仅查看该分组">
                  <i data-lucide="filter" class="w-3 h-3"></i>
                  <span>聚焦筛选</span>
                </button>
                ${g.wishlist_count > 0 ? `
                  <button onclick="Kanban.batchApplyGroup('${this.escapeHtml(g.group_name)}')" class="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm flex items-center gap-1 transition-all active:scale-95">
                    <i data-lucide="send" class="w-3 h-3"></i>
                    <span>一键投递全组 (${g.wishlist_count})</span>
                  </button>
                ` : `
                  <span class="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">该组无待投企业</span>
                `}
              </div>
            </div>
          `).join('');
        }
      }

      // 填充批量重分配中的待投企业列表
      const allWishlistJobs = await API.getJobs({ status: 'wishlist' });
      if (batchList) {
        if (allWishlistJobs.length === 0) {
          batchList.innerHTML = `<div class="text-center py-3 text-slate-500 dark:text-slate-400 text-xs">当前看板无待投状态企业</div>`;
        } else {
          batchList.innerHTML = allWishlistJobs.map(j => `
            <label class="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs">
              <div class="flex items-center gap-2">
                <input type="checkbox" name="batch-job-checkbox" value="${j.id}" class="rounded text-indigo-600 focus:ring-indigo-500">
                <span class="font-medium text-slate-900 dark:text-slate-100">${this.escapeHtml(j.company)}</span>
                <span class="text-slate-500 dark:text-slate-500">- ${this.escapeHtml(j.title)}</span>
              </div>
              <span class="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                当前: ${this.escapeHtml(j.job_group || '默认未分组')}
              </span>
            </label>
          `).join('');
        }
      }

      // 填充简历下拉列表
      const resumeSelect = document.getElementById('batch-target-resume-select');
      if (resumeSelect) {
        const resumes = await API.getResumes();
        resumeSelect.innerHTML = '<option value="">保持原简历不变</option>' + resumes.map(r => `
          <option value="${this.escapeHtml(r.version_name)}">绑定简历: ${this.escapeHtml(r.version_name)}</option>
        `).join('');
      }

      lucide.createIcons();
    } catch (e) {
      console.error('加载分组管理弹窗失败', e);
    }
  },

  async executeBatchAssign() {
    const checkboxes = document.querySelectorAll('input[name="batch-job-checkbox"]:checked');
    const jobIds = Array.from(checkboxes).map(cb => parseInt(cb.value)).filter(Boolean);
    const targetGroup = document.getElementById('batch-target-group-input')?.value.trim();
    const targetResume = document.getElementById('batch-target-resume-select')?.value.trim() || null;

    if (jobIds.length === 0) {
      App.showToast('请先勾选需要调整分组的企业', 'warning');
      return;
    }
    if (!targetGroup) {
      App.showToast('请输入或选择目标赛道分组名称', 'warning');
      return;
    }

    try {
      App.showToast(`正在将 ${jobIds.length} 家企业调入「${targetGroup}」...`, 'info');
      const res = await API.batchAssignJobsGroup(jobIds, targetGroup, targetResume);
      App.showToast(`✅ 已成功将 ${res.updated_count} 家企业调入「${targetGroup}」！`, 'success');
      await this.renderGroupManagerModalContent();
      await Kanban.loadAndRenderJobs();
      await App.populateGroupFilterOptions();
    } catch (e) {
      App.showToast(`批量调整失败: ${e.message}`, 'error');
    }
  },

  async filterBySpecificGroup(groupName) {
    await App.populateGroupFilterOptions();
    const filter = document.getElementById('group-filter');
    if (filter) {
      filter.value = groupName;
    }
    App.closeModal('wishlist-group-modal');
    App.switchView('kanban');
    await this.loadAndRenderJobs();
  },

  updateColumnCounts() {
    this.columns.forEach(col => {
      const colEl = document.getElementById(`col-${col.id}`);
      const countEl = document.getElementById(`count-${col.id}`);
      if (colEl && countEl) {
        countEl.innerText = colEl.querySelectorAll('.job-card').length;
      }
    });
  },

  async exportCSV() {
    try {
      App.showToast('正在导出求职台账为 Excel/CSV...', 'info');
      const response = await fetch('/api/jobs/export/csv');
      if (!response.ok) {
        throw new Error(`导出失败: HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `JobCopilot_求职进度台账_${todayStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      App.showToast('✅ 求职进度台账已成功导出！可用 Excel 直接打开。', 'success');
    } catch (e) {
      App.showToast('导出失败: ' + e.message, 'error');
    }
  },

  getStatusName(status) {
    const found = this.columns.find(c => c.id === status);
    return found ? found.title : status;
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
