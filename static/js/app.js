// Main Application Controller (v2.0)
const App = {
  currentView: 'kanban',
  currentEditingJob: null,
  activeDetailTab: 'annotation',

  init() {
    Theme.init();
    this.setupNavigation();
    this.setupModalDismiss();
    this.setupGlobalFilters();
    this.setupForms();
    this.setupKeyboardShortcuts();
    
    // 初始化各子模块
    Kanban.init();
    CampusRadar.init();
    PublicSectorRadar.init();
    ResumeManager.init();
    JobSearch.init();
    InterviewCalendar.init();
    OfferManager.init();
    CompanyManager.init();
    AIDeep.init();
    this.refreshStats();
    this.populateGroupFilterOptions();

    lucide.createIcons();

    // 刷新后恢复上次所在页面 (#/offers 这类路由)
    const initial = location.hash.replace(/^#\/?/, '');
    if (initial && initial !== 'kanban' && document.getElementById(`view-${initial}`)) {
      this.switchView(initial);
    }
  },


  setupNavigation() {
    // 监听导航选项卡点击
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        if (targetView) {
          this.switchView(targetView);
          // 点击菜单项后关闭所有下拉框
          document.querySelectorAll('.nav-group').forEach(g => {
            g.classList.remove('is-open');
            const groupBtn = g.querySelector('.nav-group-btn');
            if (groupBtn) groupBtn.setAttribute('aria-expanded', 'false');
          });
        }
      });
    });

    // 监听分组主按钮点击 (支持移动端/点击切换展开)
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const group = btn.closest('.nav-group');
        if (!group) return;
        const isOpen = group.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // 关闭其他已展开的分组
        document.querySelectorAll('.nav-group').forEach(other => {
          if (other !== group) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.nav-group-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // 点击外部区域自动关闭下拉框
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#main-nav')) {
        document.querySelectorAll('.nav-group').forEach(g => {
          g.classList.remove('is-open');
          const groupBtn = g.querySelector('.nav-group-btn');
          if (groupBtn) groupBtn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  },

  switchView(viewName) {
    this.currentView = viewName;
    if (location.hash !== `#/${viewName}`) history.replaceState(null, '', `#/${viewName}`);

    // 更新各个导航按钮高亮状态
    document.querySelectorAll('.nav-tab').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('is-active', 'active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('is-active', 'active');
        btn.removeAttribute('aria-current');
      }
    });

    // 更新导航父分组的高亮状态 (若当前视图属于该分组)
    document.querySelectorAll('.nav-group').forEach(group => {
      const activeChild = group.querySelector(`.nav-tab[data-view="${viewName}"]`);
      const groupBtn = group.querySelector('.nav-group-btn');
      if (groupBtn) {
        if (activeChild) {
          groupBtn.classList.add('has-active');
        } else {
          groupBtn.classList.remove('has-active');
        }
      }
    });


    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

    // Show target section
    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) targetEl.classList.remove('hidden');

    // Trigger sub-module updates
    if (viewName === 'kanban') {
      Kanban.loadAndRenderJobs();
    } else if (viewName === 'campus') {
      CampusRadar.loadData();
    } else if (viewName === 'public-sector') {
      PublicSectorRadar.loadData();
    } else if (viewName === 'search') {
      JobSearch.performSearch();
    } else if (viewName === 'calendar') {
      InterviewCalendar.loadAllInterviews().then(() => InterviewCalendar.render());
    } else if (viewName === 'offers') {
      OfferManager.loadOffers();
    } else if (viewName === 'resumes') {
      ResumeManager.loadResumes();
    } else if (viewName === 'company') {
      CompanyManager.loadRecommended();
    } else if (viewName === 'analytics') {
      Analytics.renderCharts();
    }

    lucide.createIcons();
  },

  debounce(fn, delay = 250) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  setupModalDismiss() {
    // 点击模态框半透明背景区域自动关闭
    document.addEventListener('mousedown', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop') && !e.target.classList.contains('hidden')) {
        this.closeModal(e.target.id);
      }
    });
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // 1. Esc 快捷键：一键退出当前打开的任何模态框，或清空搜索框
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
        if (openModals.length > 0) {
          openModals.forEach(m => m.classList.add('hidden'));
          return;
        }
        if (document.activeElement?.id === 'search-filter' && document.activeElement.value) {
          document.activeElement.value = '';
          document.activeElement.blur();
          if (window.Kanban) Kanban.loadAndRenderJobs();
          return;
        }
      }

      // 检查是否正在输入框或文本区内打字
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // 2. Ctrl+K 或 Cmd+K 或 单键 '/' (未在输入框时)：快捷聚焦搜索框
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (!isInputFocused && e.key === '/')) {
        e.preventDefault();
        const searchInput = this.currentView === 'search'
          ? document.getElementById('search-job-input')
          : document.getElementById('search-filter');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (isInputFocused) return;

      // 3. '?' 快捷键：呼出快捷键指南帮助面板
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        this.openShortcutsModal();
        return;
      }

      // 4. 'N' 键：快速录入新岗位
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.openCreateJobModal();
        return;
      }

      // 5. 数字键 1-5：快速切换主入口
      const viewMap = {
        '1': 'kanban',
        '2': 'search',
        '3': 'calendar',
        '4': 'offers',
        '5': 'resumes'
      };
      if (viewMap[e.key]) {
        e.preventDefault();
        this.switchView(viewMap[e.key]);
      }
    });
  },

  openShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      lucide.createIcons();
    }
  },


  setupGlobalFilters() {
    const searchFilter = document.getElementById('search-filter');
    const sourceFilter = document.getElementById('source-filter');
    const priorityFilter = document.getElementById('priority-filter');

    if (searchFilter) {
      searchFilter.addEventListener('input', this.debounce(() => Kanban.loadAndRenderJobs(), 250));
    }
    if (sourceFilter) {
      sourceFilter.addEventListener('change', () => Kanban.loadAndRenderJobs());
    }
    if (priorityFilter) {
      priorityFilter.addEventListener('change', () => Kanban.loadAndRenderJobs());
    }
    const kanbanSortFilter = document.getElementById('kanban-sort-filter');
    if (kanbanSortFilter) {
      kanbanSortFilter.addEventListener('change', () => Kanban.loadAndRenderJobs());
    }
    const groupFilter = document.getElementById('group-filter');
    if (groupFilter) {
      groupFilter.addEventListener('change', () => {
        if (groupFilter.value && groupFilter.value !== 'all') {
          localStorage.setItem('jobcopilot_kanban_group', groupFilter.value);
        } else {
          localStorage.removeItem('jobcopilot_kanban_group');
        }
        Kanban.loadAndRenderJobs();
      });
    }
  },

  setupForms() {
    // 岗位表单
    const jobForm = document.getElementById('job-create-form');
    if (jobForm) jobForm.addEventListener('submit', (e) => this.handleSaveJob(e));

    // 简历表单
    const resumeForm = document.getElementById('resume-edit-form');
    if (resumeForm) resumeForm.addEventListener('submit', (e) => ResumeManager.handleSaveResume(e));

    // 面试表单
    const interviewForm = document.getElementById('interview-add-form');
    if (interviewForm) interviewForm.addEventListener('submit', (e) => this.handleSaveInterview(e));

    // Offer 表单
    const offerForm = document.getElementById('offer-create-form');
    if (offerForm) offerForm.addEventListener('submit', (e) => OfferManager.handleSaveOffer(e));

    // AI 设置表单
    const aiForm = document.getElementById('ai-settings-form');
    if (aiForm) aiForm.addEventListener('submit', (e) => AIDeep.handleSaveSettings(e));
  },

  async refreshStats() {
    try {
      const stats = await API.getStats();
      const topCountEl = document.getElementById('top-active-count');
      if (topCountEl) {
        topCountEl.innerText = `${stats.active_in_process || 0} 个岗位推进中`;
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ====================== 岗位创建与编辑 ======================
  openCreateJobModal(defaultStatus = 'wishlist', prefill = {}) {
    const modal = document.getElementById('job-create-modal');
    document.getElementById('modal-create-title').innerText = prefill.title ? '从外部导入岗位' : '录入新岗位';
    
    document.getElementById('job-form-id').value = '';
    document.getElementById('job-title').value = prefill.title || '';
    document.getElementById('job-company').value = prefill.company || '';
    document.getElementById('job-location').value = prefill.location || '全国 / 远程';
    document.getElementById('job-salary').value = prefill.salary || '面议';
    document.getElementById('job-status').value = defaultStatus;
    const sourceUrlEl = document.getElementById('job-source-url');
    if (sourceUrlEl) sourceUrlEl.value = prefill.source_url || '';
    document.getElementById('job-group').value = prefill.job_group || '';
    document.getElementById('job-contact').value = prefill.contact_person || '';
    document.getElementById('job-priority').value = prefill.priority || 2;
    document.getElementById('job-tags').value = prefill.tags || 'Python,FastAPI';
    document.getElementById('job-jd').value = prefill.jd_text || '';

    this.populateResumeSelectOptions('job-resume-ver', prefill.resume_version);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  async handleSaveJob(e) {
    e.preventDefault();
    const id = document.getElementById('job-form-id').value;
    const data = {
      title: document.getElementById('job-title').value.trim(),
      company: document.getElementById('job-company').value.trim(),
      location: document.getElementById('job-location').value.trim(),
      salary: document.getElementById('job-salary').value.trim(),
      status: document.getElementById('job-status').value,
      source: document.getElementById('job-source').value,
      source_url: document.getElementById('job-source-url')?.value?.trim() || '',
      job_group: document.getElementById('job-group')?.value.trim() || '默认未分组',
      contact_person: document.getElementById('job-contact').value.trim(),
      priority: parseInt(document.getElementById('job-priority').value) || 2,
      tags: document.getElementById('job-tags').value.trim(),
      resume_version: document.getElementById('job-resume-ver').value,
      jd_text: document.getElementById('job-jd').value.trim()
    };

    if (!data.title || !data.company) {
      this.showToast('请填写岗位名称与公司名称', 'warning');
      return;
    }

    try {
      if (id) {
        await API.updateJob(id, data);
        this.showToast('岗位信息已成功更新', 'success');
      } else {
        await API.createJob(data);
        this.showToast('新岗位已录入看板！', 'success');
      }
      this.closeModal('job-create-modal');
      Kanban.loadAndRenderJobs();
      this.refreshStats();
      this.populateGroupFilterOptions();
    } catch (err) {
      this.showToast('保存失败: ' + err.message, 'error');
    }
  },

  // ====================== 岗位综合详情弹窗 ======================
  async openJobDetailModal(jobId) {
    try {
      const job = await API.getJob(jobId);
      this.currentEditingJob = job;

      const modal = document.getElementById('job-detail-modal');
      document.getElementById('detail-job-title').innerText = job.title;
      document.getElementById('detail-job-company').innerText = job.company;
      document.getElementById('detail-job-salary').innerText = job.salary || '面议';
      document.getElementById('detail-job-location').innerText = job.location || '不限';
      document.getElementById('detail-job-source').innerText = job.source || '其他';
      document.getElementById('detail-job-status-select').value = job.status;

      // Tab 1: JD
      document.getElementById('detail-jd-raw').value = job.jd_text || '';
      document.getElementById('detail-source-link').href = job.source_url || '#';
      document.getElementById('detail-source-link').innerText = job.source_url ? '访问原招聘网页' : '无原始链接';

      // Tab 2: Resume Annotation
      await this.populateResumeSelectOptions('detail-resume-version-select', job.resume_version);
      document.getElementById('detail-job-group').value = job.job_group || '默认未分组';
      document.getElementById('detail-resume-keypoints').value = job.resume_key_points || '';
      document.getElementById('detail-skill-gaps').value = job.skill_gaps || '';
      document.getElementById('detail-interview-strategy').value = job.interview_strategy || '';
      document.getElementById('detail-ai-match-result').innerHTML = '';

      // Tab 3: Interviews
      await this.loadInterviewsForModal(job.id);

      this.switchDetailTab('annotation');

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      lucide.createIcons();
    } catch (e) {
      this.showToast('加载岗位详情失败: ' + e.message, 'error');
    }
  },

  switchDetailTab(tabKey) {
    this.activeDetailTab = tabKey;
    document.querySelectorAll('.detail-subtab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabKey) {
        btn.classList.add('active', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      } else {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        btn.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      }
    });

    document.querySelectorAll('.detail-tab-pane').forEach(p => p.classList.add('hidden'));
    const targetPane = document.getElementById(`detail-pane-${tabKey}`);
    if (targetPane) targetPane.classList.remove('hidden');

    if (tabKey === 'company' && this.currentEditingJob) {
      CompanyManager.renderDossierInDetailModal('detail-company-container', this.currentEditingJob.company, this.currentEditingJob.title);
    }

    lucide.createIcons();
  },

  openCompanyFromDetail() {
    if (this.currentEditingJob && this.currentEditingJob.company) {
      CompanyManager.openProfileModal(this.currentEditingJob.company, this.currentEditingJob.title);
    }
  },

  async saveJobResumeAnnotation() {
    if (!this.currentEditingJob) return;
    const data = {
      job_group: document.getElementById('detail-job-group')?.value.trim() || '默认未分组',
      resume_version: document.getElementById('detail-resume-version-select').value,
      resume_key_points: document.getElementById('detail-resume-keypoints').value.trim(),
      skill_gaps: document.getElementById('detail-skill-gaps').value.trim(),
      interview_strategy: document.getElementById('detail-interview-strategy').value.trim()
    };

    try {
      await API.updateJob(this.currentEditingJob.id, data);
      this.showToast('🎯 针对该岗位的简历标注与赛道分组已保存！', 'success');
      Kanban.loadAndRenderJobs();
      this.populateGroupFilterOptions();
    } catch (e) {
      this.showToast('保存标注失败: ' + e.message, 'error');
    }
  },

  async runDetailAiMatch() {
    if (!this.currentEditingJob) return;
    const jdText = document.getElementById('detail-jd-raw').value.trim();
    if (!jdText) {
      this.showToast('当前岗位暂无 JD 文本，请先在「岗位职责」中粘贴 JD', 'warning');
      return;
    }

    const resVer = document.getElementById('detail-resume-version-select').value;
    const resumes = await API.getResumes();
    const activeResume = resumes.find(r => r.version_name === resVer) || resumes[0];

    const resultBox = document.getElementById('detail-ai-match-result');
    resultBox.innerHTML = `
      <div class="py-3 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
        正在对照「${activeResume?.version_name || '默认简历'}」进行智能诊断...
      </div>
    `;

    try {
      const res = await API.matchJd(jdText, activeResume ? activeResume.raw_content : '');
      const scoreColor = res.match_score >= 80 ? 'text-emerald-400' : res.match_score >= 50 ? 'text-amber-400' : 'text-rose-400';

      resultBox.innerHTML = `
        <div class="p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 mt-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-900 dark:text-slate-300 font-semibold">简历匹配度评分:</span>
            <span class="text-base font-bold ${scoreColor}">${res.match_score} 分</span>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 text-[11px] block mb-1">🟢 命中技术栈:</span>
            <div class="flex flex-wrap gap-1">
              ${res.matched_skills.map(s => `<span class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">${Kanban.escapeHtml(s)}</span>`).join('') || '<span class="text-slate-500">无</span>'}
            </div>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 text-[11px] block mb-1">🟡 潜在技能短板 (建议突击复习):</span>
            <div class="flex flex-wrap gap-1">
              ${res.missing_skills.map(s => `<span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px]">${Kanban.escapeHtml(s)}</span>`).join('') || '<span class="text-slate-500">无缺漏</span>'}
            </div>
          </div>
        </div>
      `;

      const gapInput = document.getElementById('detail-skill-gaps');
      if (gapInput && !gapInput.value && res.missing_skills.length > 0) {
        gapInput.value = `待突击复习: ${res.missing_skills.join(', ')}`;
      }
    } catch (e) {
      resultBox.innerHTML = `<div class="text-rose-400 text-xs py-2">分析异常: ${e.message}</div>`;
    }
  },

  async saveDetailJd() {
    if (!this.currentEditingJob) return;
    const jdText = document.getElementById('detail-jd-raw').value.trim();
    try {
      await API.updateJob(this.currentEditingJob.id, { jd_text: jdText });
      this.showToast('JD 快照文本已更新保存', 'success');
      Kanban.loadAndRenderJobs();
    } catch (e) {
      this.showToast('保存失败: ' + e.message, 'error');
    }
  },

  async handleDetailStatusChange() {
    if (!this.currentEditingJob) return;
    const newStatus = document.getElementById('detail-job-status-select').value;
    try {
      await API.updateJob(this.currentEditingJob.id, { status: newStatus });
      this.showToast(`岗位状态已切换为「${Kanban.getStatusName(newStatus)}」`, 'success');
      Kanban.loadAndRenderJobs();
      this.refreshStats();
    } catch (e) {
      this.showToast('状态更新失败: ' + e.message, 'error');
    }
  },

  async deleteCurrentJob() {
    if (!this.currentEditingJob) return;
    const ok = await UI.confirm({
      title: '删除岗位记录',
      message: `确定要彻底删除「${this.currentEditingJob.company} - ${this.currentEditingJob.title}」吗？\n删除后该岗位的所有面试排期及复盘记录将一并清除。`,
      danger: true,
      confirmText: '确认删除'
    });
    if (!ok) return;

    try {
      await API.deleteJob(this.currentEditingJob.id);
      this.showToast('岗位已删除', 'success');
      this.closeModal('job-detail-modal');
      Kanban.loadAndRenderJobs();
      this.refreshStats();
    } catch (e) {
      this.showToast('删除失败: ' + e.message, 'error');
    }
  },

  // ====================== 面试记录与复盘 ======================
  async loadInterviewsForModal(jobId) {
    const listContainer = document.getElementById('detail-interviews-list');
    if (!listContainer) return;

    try {
      const interviews = await API.getInterviews(jobId);
      if (interviews.length === 0) {
        listContainer.innerHTML = `
          <div class="py-8 text-center text-slate-500 text-xs">
            <i data-lucide="calendar" class="w-8 h-8 mx-auto mb-2 text-slate-600"></i>
            暂未添加面试轮次记录。收到面试通知后，可点击上方添加！
          </div>
        `;
        lucide.createIcons();
        return;
      }

      listContainer.innerHTML = interviews.map((item) => `
        <div class="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <h5 class="font-bold text-sm text-slate-900 dark:text-slate-200">${Kanban.escapeHtml(item.round_name)}</h5>
              <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">${Kanban.escapeHtml(item.interview_time || '时间未定')}</span>
            </div>
            <button onclick="App.deleteInterview(${item.id})" class="text-xs text-rose-400 hover:text-rose-300 p-1">
              <i data-lucide="trash" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          ${item.meeting_link ? `
            <div class="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
              <span>📍 面试地点/会议号: ${Kanban.escapeHtml(item.meeting_link)}</span>
            </div>
          ` : ''}

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">❓ 面试被提问的问题 / 笔试真题:</label>
            <div class="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-300 whitespace-pre-wrap font-mono">
              ${Kanban.escapeHtml(item.questions_notes || '暂未记录')}
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-amber-400 mb-1">📝 自我复盘与答题漏洞 (Retrospective):</label>
            <div class="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-300 whitespace-pre-wrap">
              ${Kanban.escapeHtml(item.retrospective || '暂未填写复盘笔记')}
            </div>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    } catch (e) {
      listContainer.innerHTML = `<div class="text-rose-400 text-xs py-2">加载面试记录失败</div>`;
    }
  },

  openAddInterviewModal() {
    if (!this.currentEditingJob) return;
    document.getElementById('interview-job-id').value = this.currentEditingJob.id;
    document.getElementById('interview-round').value = '技术一面';
    document.getElementById('interview-time').value = '';
    document.getElementById('interview-link').value = '';
    document.getElementById('interview-questions').value = '';
    document.getElementById('interview-retrospective').value = '';

    const modal = document.getElementById('interview-add-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  async handleSaveInterview(e) {
    e.preventDefault();
    const jobId = parseInt(document.getElementById('interview-job-id').value);
    const data = {
      job_id: jobId,
      round_name: document.getElementById('interview-round').value.trim(),
      interview_time: document.getElementById('interview-time').value.trim(),
      meeting_link: document.getElementById('interview-link').value.trim(),
      questions_notes: document.getElementById('interview-questions').value.trim(),
      retrospective: document.getElementById('interview-retrospective').value.trim()
    };

    try {
      await API.createInterview(data);
      this.showToast('面试记录已保存并同步状态！', 'success');
      this.closeModal('interview-add-modal');
      await this.loadInterviewsForModal(jobId);
      Kanban.loadAndRenderJobs();
      InterviewCalendar.loadAllInterviews().then(() => InterviewCalendar.render());
    } catch (err) {
      this.showToast('添加面试记录失败: ' + err.message, 'error');
    }
  },

  async deleteInterview(interviewId) {
    const ok = await UI.confirm({
      title: '删除面试记录',
      message: '确定删除该轮面试记录吗？该操作不可恢复。',
      danger: true,
      confirmText: '确认删除'
    });
    if (!ok) return;
    try {
      await API.deleteInterview(interviewId);
      this.showToast('面试记录已删除', 'success');
      if (this.currentEditingJob) {
        await this.loadInterviewsForModal(this.currentEditingJob.id);
      }
      InterviewCalendar.loadAllInterviews().then(() => InterviewCalendar.render());
    } catch (e) {
      this.showToast('删除失败: ' + e.message, 'error');
    }
  },

  async predictInterviewQuestions() {
    if (!this.currentEditingJob) return;
    const jdText = document.getElementById('detail-jd-raw').value.trim();
    const title = this.currentEditingJob.title;

    const resultBox = document.getElementById('predicted-questions-box');
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
      <div class="py-3 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
        AI 正在解析该岗位核心考点并预测高频面试题...
      </div>
    `;

    try {
      const questions = await API.predictQuestions(title, jdText);
      resultBox.innerHTML = `
        <div class="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-3">
          <div class="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            <span>针对本岗位 JD 智能预测的高频面试题</span>
          </div>

          <div class="space-y-2.5">
            ${questions.map((q, idx) => `
              <div class="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">${Kanban.escapeHtml(q.category)}</span>
                  <span class="font-semibold text-slate-900 dark:text-slate-200">Q${idx+1}: ${Kanban.escapeHtml(q.question)}</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">💡 准备提示: ${Kanban.escapeHtml(q.tip)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      lucide.createIcons();
    } catch (e) {
      resultBox.innerHTML = `<div class="text-rose-400 text-xs py-2">预测生成失败: ${e.message}</div>`;
    }
  },

  // ====================== 辅助工具方法 ======================
  async populateResumeSelectOptions(selectId, selectedValue = '') {
    const select = document.getElementById(selectId);
    if (!select) return;

    const resumes = await API.getResumes();
    select.innerHTML = resumes.map(r => `
      <option value="${r.version_name}" ${r.version_name === selectedValue ? 'selected' : ''}>
        ${r.version_name} (${r.target_role || '通用'})
      </option>
    `).join('');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  showToast(message, type = 'info') {
    if (window.UI && typeof UI.toast === 'function') {
      UI.toast(message, type);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
      success: 'bg-emerald-600 text-white border-emerald-500',
      warning: 'bg-amber-600 text-white border-amber-500',
      error: 'bg-rose-600 text-white border-rose-500',
      info: 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
    };

    const icons = {
      success: 'check-circle',
      warning: 'alert-triangle',
      error: 'alert-octagon',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium ${colors[type]} transition-all transform duration-300 translate-y-2 opacity-0`;
    toast.innerHTML = `
      <i data-lucide="${icons[type]}" class="w-4 h-4 flex-shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  async populateGroupFilterOptions() {
    try {
      const summary = await API.getGroupsSummary();
      const groups = Array.isArray(summary) ? summary : (summary.groups || []);
      const filter = document.getElementById('group-filter');
      const datalist = document.getElementById('job-group-datalist');
      
      if (filter) {
        const savedGroup = localStorage.getItem('jobcopilot_kanban_group') || 'all';
        const currentVal = filter.value || savedGroup;
        let filterHtml = '<option value="all">全部分组赛道</option>';
        groups.forEach(g => {
          filterHtml += `<option value="${this.escapeHtml(g.group_name)}">${this.escapeHtml(g.group_name)} (${g.wishlist_count}待投 / 共${g.total_jobs}家)</option>`;
        });
        filter.innerHTML = filterHtml;
        const targetVal = groups.some(g => g.group_name === currentVal) ? currentVal : (groups.some(g => g.group_name === savedGroup) ? savedGroup : 'all');
        filter.value = targetVal;
      }

      if (datalist) {
        const defaultPresetGroups = [
          "默认未分组",
          "算法与AI模型组",
          "后端开发组",
          "前端与客户端组",
          "临床医学与CRA组",
          "综合管培生组",
          "央国企专报组"
        ];
        const existingNames = new Set(groups.map(g => g.group_name));
        defaultPresetGroups.forEach(name => existingNames.add(name));
        datalist.innerHTML = Array.from(existingNames).map(name => `<option value="${this.escapeHtml(name)}"></option>`).join('');
      }
    } catch (e) {
      console.error("加载分组下拉选项失败", e);
    }
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

// 页面加载启动
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
