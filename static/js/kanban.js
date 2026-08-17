// Kanban Board Logic
const Kanban = {
  columns: [
    { id: 'wishlist', title: '意向待投', icon: 'bookmark', color: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400' },
    { id: 'applied', title: '已投递', icon: 'send', color: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { id: 'screening', title: '初筛 / 笔试', icon: 'file-text', color: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { id: 'interview', title: '面试中', icon: 'users', color: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    { id: 'offer', title: '已获 Offer', icon: 'award', color: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    { id: 'rejected', title: '未通过 / 归档', icon: 'archive', color: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400' }
  ],

  sortableInstances: [],

  init() {
    this.renderColumnsStructure();
    this.loadAndRenderJobs();
  },

  renderColumnsStructure() {
    const container = document.getElementById('kanban-container');
    if (!container) return;

    container.innerHTML = this.columns.map(col => `
      <div class="flex flex-col flex-shrink-0 w-80 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <!-- Column Header -->
        <div class="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${col.bg} border ${col.color}"></span>
            <h3 class="font-semibold text-sm text-slate-200">${col.title}</h3>
            <span id="count-${col.id}" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">0</span>
          </div>
          <button onclick="App.openCreateJobModal('${col.id}')" class="text-slate-400 hover:text-slate-100 hover:bg-slate-800 p-1 rounded transition-colors" title="在此状态下新增岗位">
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Cards Container -->
        <div id="col-${col.id}" data-status="${col.id}" class="kanban-column flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[500px] max-h-[calc(100vh-230px)]">
          <!-- Job cards will be injected here -->
        </div>
      </div>
    `).join('');

    lucide.createIcons();
    this.setupDragAndDrop();
  },

  setupDragAndDrop() {
    // 销毁旧的 Sortable 实例
    this.sortableInstances.forEach(s => s.destroy());
    this.sortableInstances = [];

    this.columns.forEach(col => {
      const el = document.getElementById(`col-${col.id}`);
      if (!el) return;

      const sortable = new Sortable(el, {
        group: 'job-kanban',
        animation: 180,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: async (evt) => {
          const jobId = evt.item.getAttribute('data-job-id');
          const newStatus = evt.to.getAttribute('data-status');
          const oldStatus = evt.from.getAttribute('data-status');

          if (newStatus !== oldStatus) {
            try {
              await API.updateJob(jobId, { status: newStatus });
              App.showToast(`状态已更新为「${Kanban.getStatusName(newStatus)}」`, 'success');
              Kanban.updateColumnCounts();
              App.refreshStats();
            } catch (err) {
              App.showToast('更新状态失败: ' + err.message, 'error');
              Kanban.loadAndRenderJobs();
            }
          }
        }
      });
      this.sortableInstances.push(sortable);
    });
  },

  async loadAndRenderJobs() {
    try {
      const keyword = document.getElementById('search-filter')?.value || '';
      const source = document.getElementById('source-filter')?.value || '';
      const priority = document.getElementById('priority-filter')?.value || '';

      const jobs = await API.getJobs({ keyword, source });

      // 清空各列
      this.columns.forEach(col => {
        const colEl = document.getElementById(`col-${col.id}`);
        if (colEl) colEl.innerHTML = '';
      });

      // 填充卡片
      jobs.forEach(job => {
        if (priority && priority !== 'all' && String(job.priority) !== priority) {
          return;
        }

        const colEl = document.getElementById(`col-${job.status}`);
        if (colEl) {
          colEl.insertAdjacentHTML('beforeend', this.createJobCardHtml(job));
        }
      });

      this.updateColumnCounts();
      lucide.createIcons();
    } catch (e) {
      console.error("加载岗位失败", e);
    }
  },

  createJobCardHtml(job) {
    const priorityColors = {
      1: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      2: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      3: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    };
    const priorityLabels = { 1: '高优', 2: '中等', 3: '备选' };

    const tags = (job.tags || '').split(',').filter(t => t.trim()).slice(0, 3);

    return `
      <div data-job-id="${job.id}" onclick="App.openJobDetailModal(${job.id})" 
           class="job-card bg-slate-800/90 border border-slate-700/80 hover:border-blue-500/60 rounded-lg p-3.5 cursor-pointer shadow-sm relative group">
        
        <!-- Header: Title & Priority -->
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <h4 class="font-semibold text-sm text-slate-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            ${this.escapeHtml(job.title)}
          </h4>
          <span class="text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[job.priority] || priorityColors[2]} flex-shrink-0 font-medium">
            ${priorityLabels[job.priority] || '中等'}
          </span>
        </div>

        <!-- Company & Location -->
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
          <i data-lucide="building-2" class="w-3.5 h-3.5 text-slate-500 flex-shrink-0"></i>
          <span class="font-medium text-slate-300 truncate">${this.escapeHtml(job.company)}</span>
          <span class="text-slate-600">•</span>
          <span class="text-slate-400 truncate">${this.escapeHtml(job.location || '不限')}</span>
        </div>

        <!-- Salary & Source Badges -->
        <div class="flex items-center gap-2 mb-2.5 flex-wrap">
          <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ${this.escapeHtml(job.salary || '面议')}
          </span>
          <span class="text-[11px] text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded border border-slate-600/40">
            ${this.escapeHtml(job.source || '其他')}
          </span>
        </div>

        <!-- Resume Version Tag (Highlighting Feature) -->
        ${job.resume_version ? `
          <div class="mb-2.5 flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
            <i data-lucide="file-check" class="w-3 h-3 text-indigo-400"></i>
            <span class="truncate">投递版本: ${this.escapeHtml(job.resume_version)}</span>
          </div>
        ` : ''}

        <!-- Tags -->
        ${tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-2">
            ${tags.map(t => `<span class="text-[10px] bg-slate-700/40 text-slate-400 px-1.5 py-0.5 rounded">${this.escapeHtml(t.trim())}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Footer: Updated Date & Actions -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-700/50">
          <span>${job.applied_at ? `投于 ${job.applied_at}` : `更新于 ${job.updated_at.split(' ')[0]}`}</span>
          <div class="flex items-center gap-2">
            ${job.jd_text ? '<span title="已保存JD快照" class="text-blue-400"><i data-lucide="file-text" class="w-3.5 h-3.5"></i></span>' : ''}
            ${job.resume_key_points ? '<span title="已做针对性简历标注" class="text-amber-400"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i></span>' : ''}
          </div>
        </div>
      </div>
    `;
  },

  updateColumnCounts() {
    this.columns.forEach(col => {
      const colEl = document.getElementById(`col-${col.id}`);
      const countEl = document.getElementById(`count-${col.id}`);
      if (colEl && countEl) {
        countEl.innerText = colEl.children.length;
      }
    });
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
      .replace(/"/g, '&quot;');
  }
};
