// Deep AI Features: Universal OpenAI-compatible LLM Settings, Resume Tailoring & Mock Interview
const AIDeep = {
  mockHistory: [],
  currentMockJd: "",

  // 常用平台快捷填充模板
  presets: {
    openai: {
      url: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini'
    },
    siliconflow: {
      url: 'https://api.siliconflow.cn/v1',
      model: 'deepseek-ai/DeepSeek-V3'
    },
    deepseek: {
      url: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    },
    moonshot: {
      url: 'https://api.moonshot.cn/v1',
      model: 'moonshot-v1-8k'
    },
    zhipu: {
      url: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4-flash'
    },
    qwen: {
      url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-turbo'
    },
    ollama: {
      url: 'http://localhost:11434/v1',
      model: 'deepseek-r1:latest'
    },
    lmstudio: {
      url: 'http://localhost:1234/v1',
      model: 'local-model'
    },
    custom: {
      url: 'https://api.example.com/v1',
      model: 'custom-model'
    }
  },

  init() {
    // 初始化无限制配置
  },

  applyPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;

    const urlInput = document.getElementById('setting-ai-base-url');
    const modelInput = document.getElementById('setting-ai-model');

    if (urlInput) urlInput.value = p.url;
    if (modelInput) modelInput.value = p.model;

    // 高亮当前选中的快捷按钮
    document.querySelectorAll('.preset-btn').forEach(btn => {
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.classList.add('border-indigo-500', 'text-indigo-400', 'bg-indigo-500/10');
        btn.classList.remove('border-slate-800', 'text-slate-400');
      } else {
        btn.classList.remove('border-indigo-500', 'text-indigo-400', 'bg-indigo-500/10');
        btn.classList.add('border-slate-800', 'text-slate-400');
      }
    });

    App.showToast(`已快捷填充「${presetKey}」接口模板，可按需修改`, 'info');
  },

  // ====================== 通用 AI 配置面板 ======================
  async openSettingsModal() {
    const modal = document.getElementById('ai-settings-modal');
    const statusText = document.getElementById('ai-test-status-msg');
    if (statusText) statusText.innerText = '';

    try {
      const cfg = await API.getLLMSettings();
      document.getElementById('setting-ai-base-url').value = cfg.base_url || 'https://api.openai.com/v1';
      document.getElementById('setting-ai-model').value = cfg.model_name || 'gpt-4o-mini';
      document.getElementById('setting-ai-key').value = cfg.masked_key || '';
      document.getElementById('setting-ai-key').placeholder = cfg.has_key ? '已保存 API Key (保持不变或输入新Key)' : 'sk-...';
    } catch (e) {
      console.error("加载 AI 设置失败", e);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  async handleSaveSettings(e) {
    e.preventDefault();
    const data = {
      provider: 'custom', // 统一为通用协议
      base_url: document.getElementById('setting-ai-base-url').value.trim(),
      api_key: document.getElementById('setting-ai-key').value.trim(),
      model_name: document.getElementById('setting-ai-model').value.trim()
    };

    if (!data.base_url || !data.model_name) {
      App.showToast('请填写 API Base URL 与模型名称', 'warning');
      return;
    }

    try {
      await API.saveLLMSettings(data);
      App.showToast('通用大模型配置已成功保存！', 'success');
      App.closeModal('ai-settings-modal');
    } catch (err) {
      App.showToast('保存失败: ' + err.message, 'error');
    }
  },

  async testConnection() {
    const statusEl = document.getElementById('ai-test-status-msg');
    const testBtn = document.getElementById('btn-test-ai-conn');

    statusEl.innerHTML = `<span class="text-slate-400">正在通过通用协议测试与大模型接口的连通性...</span>`;
    testBtn.disabled = true;

    const data = {
      provider: 'custom',
      base_url: document.getElementById('setting-ai-base-url').value.trim(),
      api_key: document.getElementById('setting-ai-key').value.trim(),
      model_name: document.getElementById('setting-ai-model').value.trim()
    };

    try {
      const res = await API.testLLMConnection(data);
      if (res.success) {
        statusEl.innerHTML = `<span class="text-emerald-400 font-semibold">✅ 连通成功！模型应答: ${Kanban.escapeHtml(res.reply)}</span>`;
      } else {
        statusEl.innerHTML = `<span class="text-rose-400 font-semibold">❌ 连通失败: ${Kanban.escapeHtml(res.error)}</span>`;
      }
    } catch (e) {
      statusEl.innerHTML = `<span class="text-rose-400 font-semibold">❌ 请求发生异常: ${Kanban.escapeHtml(e.message)}</span>`;
    } finally {
      testBtn.disabled = false;
    }
  },

  async purgeAllData() {
    if (!confirm('⚠️ 危险操作：确定要彻底清空全站数据吗？\n\n此操作将同时清空【求职看板、面试排期、简历库、Offer测算、秋招雷达、考公国企】所有本地记录，并恢复为 100% 纯净初始系统（0条记录）。操作后不可逆！')) {
      return;
    }

    try {
      const res = await API.purgeAllData();
      App.closeModal('ai-settings-modal');
      App.showToast(res.message || '全站业务数据已清空，系统已恢复为纯净状态！', 'success');
      
      // 重新刷新各模块界面
      Kanban.loadAndRenderJobs();
      if (window.CampusRadar) CampusRadar.loadData();
      if (window.PublicSectorRadar) PublicSectorRadar.loadData();
      if (window.InterviewCalendar) InterviewCalendar.loadAllInterviews().then(() => InterviewCalendar.render());
      if (window.OfferManager) OfferManager.loadOffers();
      if (window.ResumeManager) ResumeManager.loadResumes();
      if (window.Analytics) Analytics.renderCharts();
      App.refreshStats();
    } catch (e) {
      console.error('清空全站数据失败', e);
      App.showToast('清空全站数据失败: ' + e.message, 'error');
    }
  },

  // ====================== 针对性简历润色改写 ======================
  async runResumeTailoring(jobId) {
    const job = App.currentEditingJob;
    if (!job) return;

    const jdText = document.getElementById('detail-jd-raw').value.trim();
    if (!jdText) {
      App.showToast('请先填写岗位 JD 职责要求', 'warning');
      return;
    }

    const resVer = document.getElementById('detail-resume-version-select').value;
    const resumes = await API.getResumes();
    const activeResume = resumes.find(r => r.version_name === resVer) || resumes[0];

    const modal = document.getElementById('ai-tailor-modal');
    const contentEl = document.getElementById('ai-tailor-content');
    document.getElementById('ai-tailor-job-title').innerText = `${job.company} - ${job.title}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    contentEl.innerHTML = `
      <div class="py-12 text-center text-slate-400">
        <div class="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm font-semibold text-slate-200">AI 专家正在对比 JD 与简历，生成专属改写方案...</p>
        <p class="text-xs text-slate-500 mt-1">运用 STAR 原则重构经历，强化核心技术关键词</p>
      </div>
    `;

    try {
      const res = await API.tailorResume(activeResume ? activeResume.raw_content : '', jdText);
      contentEl.innerHTML = `
        <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
          ${Kanban.escapeHtml(res.advice)}
        </div>
      `;
    } catch (e) {
      contentEl.innerHTML = `<div class="text-rose-400 py-6 text-center text-xs">改写生成异常: ${e.message}</div>`;
    }
    lucide.createIcons();
  },

  // ====================== AI 模拟面试官对话 ======================
  openMockInterview(jobId) {
    const job = App.currentEditingJob;
    if (!job) return;

    this.currentMockJd = document.getElementById('detail-jd-raw').value.trim() || `${job.title} at ${job.company}`;
    this.mockHistory = [];

    const modal = document.getElementById('mock-interview-modal');
    document.getElementById('mock-job-title').innerText = `${job.company} · ${job.title}`;
    
    const chatContainer = document.getElementById('mock-chat-messages');
    chatContainer.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          AI
        </div>
        <div class="chat-bubble-interviewer p-3.5 text-xs text-slate-200 max-w-xl leading-relaxed">
          你好！我是本次【${job.company} - ${job.title}】的模拟技术面试官。
          我已经阅读了该岗位的职责要求。准备好了吗？点击下方【发送回答】或直接在输入框打字即可开始模拟对练！
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  },

  async sendMockAnswer() {
    const input = document.getElementById('mock-user-input');
    const answer = input ? input.value.trim() : '';
    const chatContainer = document.getElementById('mock-chat-messages');
    const sendBtn = document.getElementById('btn-mock-send');

    if (!answer && this.mockHistory.length > 0) return;

    if (answer) {
      chatContainer.insertAdjacentHTML('beforeend', `
        <div class="flex items-start justify-end gap-3">
          <div class="chat-bubble-user p-3.5 text-xs max-w-xl leading-relaxed whitespace-pre-wrap">
            ${Kanban.escapeHtml(answer)}
          </div>
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            我
          </div>
        </div>
      `);
      this.mockHistory.push({ role: "user", content: answer });
      input.value = '';
    }

    const loadingId = 'loading-' + Date.now();
    chatContainer.insertAdjacentHTML('beforeend', `
      <div id="${loadingId}" class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          AI
        </div>
        <div class="chat-bubble-interviewer p-3.5 text-xs text-slate-400 flex items-center gap-2">
          <div class="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span>面试官正在评估你的回答并构思下一道提问...</span>
        </div>
      </div>
    `);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    sendBtn.disabled = true;

    try {
      const res = await API.mockInterviewTurn(this.mockHistory, this.currentMockJd, answer);
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      chatContainer.insertAdjacentHTML('beforeend', `
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            AI
          </div>
          <div class="chat-bubble-interviewer p-3.5 text-xs text-slate-200 max-w-xl leading-relaxed whitespace-pre-wrap">
            ${Kanban.escapeHtml(res.reply)}
          </div>
        </div>
      `);
      this.mockHistory.push({ role: "assistant", content: res.reply });
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (e) {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      chatContainer.insertAdjacentHTML('beforeend', `
        <div class="text-rose-400 text-xs py-2 text-center">回答解析失败: ${e.message}</div>
      `);
    } finally {
      sendBtn.disabled = false;
    }
  }
};
