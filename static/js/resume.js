// Resume Profile Management & PDF Parser & AI Matcher Logic
const ResumeManager = {
  resumes: [],
  currentResumeId: null,

  init() {
    this.setupPdfUploadZone();
    this.loadResumes();
  },

  setupPdfUploadZone() {
    const fileInput = document.getElementById('pdf-file-input');
    const dropZone = document.getElementById('pdf-drop-zone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleUploadPdfFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add('border-indigo-500', 'bg-indigo-500/10');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-indigo-500', 'bg-indigo-500/10');
        }, false);
      });

      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files[0]) {
          this.handleUploadPdfFile(files[0]);
        }
      });
    }
  },

  async handleUploadPdfFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      App.showToast('请上传 .pdf 格式的简历文件', 'warning');
      return;
    }

    const uploadText = document.getElementById('pdf-upload-status');
    if (uploadText) {
      uploadText.innerHTML = `
        <div class="flex items-center justify-center gap-2 text-indigo-400 text-xs py-2">
          <div class="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span>正在智能解析 ${file.name} 中的文本与技能点...</span>
        </div>
      `;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.uploadPDF(formData);
      App.showToast(`🎉 PDF 简历解析成功！已自动录入版本「${res.resume.version_name}」`, 'success');
      if (uploadText) {
        uploadText.innerHTML = `
          <div class="text-emerald-400 text-xs py-1 font-semibold flex items-center justify-center gap-1">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>已成功解析 ${res.page_count} 页简历文本并归档！</span>
          </div>
        `;
      }
      await this.loadResumes();
      this.selectResume(res.resume.id);
    } catch (e) {
      App.showToast('PDF 解析失败: ' + e.message, 'error');
      if (uploadText) {
        uploadText.innerHTML = `<span class="text-rose-400 text-xs">解析失败: ${e.message}</span>`;
      }
    }
    lucide.createIcons();
  },

  async loadResumes() {
    try {
      this.resumes = await API.getResumes();
      this.renderResumeList();
      if (this.resumes.length > 0 && !this.currentResumeId) {
        this.selectResume(this.resumes[0].id);
      }
    } catch (e) {
      console.error("加载简历版本库失败", e);
    }
  },

  renderResumeList() {
    const listContainer = document.getElementById('resume-versions-list');
    if (!listContainer) return;

    if (this.resumes.length === 0) {
      listContainer.innerHTML = `
        <div class="py-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <i data-lucide="file-x-2" class="w-7 h-7 mx-auto mb-2 text-slate-600"></i>
          <p class="font-medium text-slate-500 dark:text-slate-400">暂未添加简历版本</p>
          <p class="text-[11px] text-slate-500 mt-1">拖拽上方 PDF 或点击右上角【新建简历版本】</p>
        </div>
      `;
      const detailContainer = document.getElementById('resume-detail-view');
      if (detailContainer) {
        detailContainer.innerHTML = `
          <div class="bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <i data-lucide="file-text" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-300">暂无简历详情</p>
            <p class="text-xs text-slate-500 mt-1">请先录入或上传一份个人简历文本用于 AI 诊断与针对性改写</p>
          </div>
        `;
      }
      lucide.createIcons();
      return;
    }

    listContainer.innerHTML = this.resumes.map(r => `
      <div onclick="ResumeManager.selectResume(${r.id})" 
           class="p-4 rounded-xl border cursor-pointer transition-all ${this.currentResumeId === r.id ? 'bg-indigo-600/10 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-700'}">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">${Kanban.escapeHtml(r.version_name)}</h4>
              ${r.file_name ? `<span class="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1 py-0.2 rounded">PDF</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${Kanban.escapeHtml(r.target_role || '未定目标')}</p>
          </div>
          <span class="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
            ${r.updated_at ? r.updated_at.split(' ')[0] : '刚刚'}
          </span>
        </div>

        <div class="mt-3 flex flex-wrap gap-1">
          ${(r.highlights || '').split(',').filter(t => t.trim()).slice(0, 4).map(t => `
            <span class="text-[10px] bg-slate-50 dark:bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">${Kanban.escapeHtml(t.trim())}</span>
          `).join('')}
        </div>
      </div>
    `).join('');

    lucide.createIcons();
  },

  selectResume(id) {
    this.currentResumeId = id;
    this.renderResumeList();
    const resume = this.resumes.find(r => r.id === id);
    if (!resume) return;

    const detailContainer = document.getElementById('resume-detail-view');
    if (!detailContainer) return;

    detailContainer.innerHTML = `
      <div class="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">${Kanban.escapeHtml(resume.version_name)}</h3>
              <span class="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-medium">
                ${Kanban.escapeHtml(resume.target_role)}
              </span>
              ${resume.file_name ? `<span class="text-xs text-slate-500">📎 来源: ${Kanban.escapeHtml(resume.file_name)}</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">创建时间: ${resume.created_at} | 最后更新: ${resume.updated_at}</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="ResumeManager.openEditModal(${resume.id})" class="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>编辑文本</span>
            </button>
            <button onclick="ResumeManager.deleteResume(${resume.id})" class="text-xs text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors" title="删除该版本">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Highlights & Skills -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">主打核心技术与亮点标签 (自动提炼)</label>
          <div class="flex flex-wrap gap-1.5">
            ${(resume.highlights || '').split(',').filter(t => t.trim()).map(t => `
              <span class="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-md font-medium">
                ${Kanban.escapeHtml(t.trim())}
              </span>
            `).join('') || '<span class="text-xs text-slate-500">未设置亮点标签</span>'}
          </div>
        </div>

        <!-- Raw Resume Content Preview -->
        <div class="mb-6">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">简历文本内容 (用于 AI 比对)</label>
          <div class="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
            ${Kanban.escapeHtml(resume.raw_content || '暂无简历文本')}
          </div>
        </div>

        <!-- Quick AI Match Simulator -->
        <div class="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-blue-400"></i>
            <h4 class="text-sm font-bold text-blue-200">AI 岗位匹配度即时试测</h4>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">粘贴一段目标岗位 JD 文本，AI 将立即计算该简历版本的技能契合度与缺少技术点。</p>
          <textarea id="ai-test-jd" rows="3" placeholder="在此粘贴目标岗位职责与要求..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 mb-3"></textarea>
          <button onclick="ResumeManager.runAiTest()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
            <span>开始 AI 匹配诊断</span>
          </button>
          
          <div id="ai-test-result" class="mt-4 hidden"></div>
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  async runAiTest() {
    const resume = this.resumes.find(r => r.id === this.currentResumeId);
    const jdInput = document.getElementById('ai-test-jd');
    const resultBox = document.getElementById('ai-test-result');
    if (!resume || !jdInput || !resultBox) return;

    const jdText = jdInput.value.trim();
    if (!jdText) {
      App.showToast('请先输入一段岗位 JD 文本', 'warning');
      return;
    }

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
      <div class="py-4 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        AI 正在分析技能拓扑与匹配度...
      </div>
    `;

    try {
      const res = await API.matchJd(jdText, resume.raw_content);
      const scoreColor = res.match_score >= 80 ? 'text-emerald-400' : res.match_score >= 50 ? 'text-amber-400' : 'text-rose-400';

      resultBox.innerHTML = `
        <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900 dark:text-slate-300">整体匹配评分</span>
            <span class="text-lg font-bold ${scoreColor}">${res.match_score} / 100 分</span>
          </div>

          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-1">🟢 简历完全匹配技能:</span>
            <div class="flex flex-wrap gap-1">
              ${res.matched_skills.map(s => `<span class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">${Kanban.escapeHtml(s)}</span>`).join('') || '<span class="text-slate-500">无明显匹配词</span>'}
            </div>
          </div>

          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-1">🟡 JD 要求但简历可能缺漏的技能 (Gap):</span>
            <div class="flex flex-wrap gap-1">
              ${res.missing_skills.map(s => `<span class="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px]">${Kanban.escapeHtml(s)}</span>`).join('') || '<span class="text-slate-500">无明显缺漏，匹配完美！</span>'}
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span class="text-blue-400 font-semibold block mb-1">💡 投递与面试建议:</span>
            <ul class="list-disc list-inside text-slate-900 dark:text-slate-300 space-y-1">
              ${res.suggestions.map(s => `<li>${Kanban.escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    } catch (e) {
      resultBox.innerHTML = `<div class="text-rose-400 text-xs py-2">分析异常: ${e.message}</div>`;
    }
  },

  openCreateModal() {
    const modal = document.getElementById('resume-edit-modal');
    document.getElementById('modal-resume-title').innerText = '新建简历版本';
    document.getElementById('resume-form-id').value = '';
    document.getElementById('resume-version-name').value = '';
    document.getElementById('resume-target-role').value = 'Python 后端工程师';
    document.getElementById('resume-highlights').value = 'Python, FastAPI, Redis, MySQL, Docker';
    document.getElementById('resume-raw-content').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  openEditModal(id) {
    const resume = this.resumes.find(r => r.id === id);
    if (!resume) return;

    const modal = document.getElementById('resume-edit-modal');
    document.getElementById('modal-resume-title').innerText = '编辑简历版本';
    document.getElementById('resume-form-id').value = resume.id;
    document.getElementById('resume-version-name').value = resume.version_name;
    document.getElementById('resume-target-role').value = resume.target_role || '';
    document.getElementById('resume-highlights').value = resume.highlights || '';
    document.getElementById('resume-raw-content').value = resume.raw_content || '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  async handleSaveResume(e) {
    e.preventDefault();
    const id = document.getElementById('resume-form-id').value;
    const data = {
      version_name: document.getElementById('resume-version-name').value.trim(),
      target_role: document.getElementById('resume-target-role').value.trim(),
      highlights: document.getElementById('resume-highlights').value.trim(),
      raw_content: document.getElementById('resume-raw-content').value.trim()
    };

    if (!data.version_name) {
      App.showToast('请输入简历版本名称', 'warning');
      return;
    }

    try {
      if (id) {
        await API.updateResume(id, data);
        App.showToast('简历版本已更新', 'success');
      } else {
        const created = await API.createResume(data);
        this.currentResumeId = created.id;
        App.showToast('新建简历版本成功', 'success');
      }
      this.closeModal();
      await this.loadResumes();
    } catch (err) {
      App.showToast('保存失败: ' + err.message, 'error');
    }
  },

  async deleteResume(id) {
    if (!confirm('确定要删除此简历版本吗？')) return;
    try {
      await API.deleteResume(id);
      App.showToast('简历版本已删除', 'success');
      this.currentResumeId = null;
      await this.loadResumes();
    } catch (err) {
      App.showToast('删除失败: ' + err.message, 'error');
    }
  },

  closeModal() {
    const modal = document.getElementById('resume-edit-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
};
