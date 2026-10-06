// 统一 UI 组件 (v4.5): 自绘确认框 / 空状态,替代浏览器原生 confirm()
const UI = {
  _confirmOpen: false,

  /**
   * 自绘确认框,返回 Promise<boolean>。
   *   const ok = await UI.confirm({ title: '删除岗位', message: '此操作不可恢复', danger: true });
   * 支持: Esc 取消 / Enter 确认 / 点击遮罩取消 / Tab 焦点循环 / 关闭后焦点还原。
   */
  confirm({ title = '请确认', message = '', confirmText = '确认', cancelText = '取消', danger = false } = {}) {
    if (this._confirmOpen) return Promise.resolve(false);
    this._confirmOpen = true;
    const previouslyFocused = document.activeElement;

    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'ui-confirm-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm';
      backdrop.setAttribute('role', 'alertdialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-labelledby', 'ui-confirm-title');
      backdrop.setAttribute('aria-describedby', 'ui-confirm-msg');

      const iconName = danger ? 'alert-triangle' : 'help-circle';
      const iconTone = danger
        ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400';
      const confirmTone = danger
        ? 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-400'
        : 'bg-blue-600 hover:bg-blue-500 focus-visible:ring-blue-400';

      backdrop.innerHTML = `
        <div class="modal-content w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${iconTone}">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <div class="min-w-0 flex-1">
              <h3 id="ui-confirm-title" class="text-sm font-bold text-slate-900 dark:text-slate-100"></h3>
              <p id="ui-confirm-msg" class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 whitespace-pre-line break-words"></p>
            </div>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" data-act="cancel" class="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"></button>
            <button type="button" data-act="ok" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 ${confirmTone}"></button>
          </div>
        </div>`;

      // 文本一律用 textContent 写入,杜绝注入
      backdrop.querySelector('#ui-confirm-title').textContent = title;
      backdrop.querySelector('#ui-confirm-msg').textContent = message;
      const cancelBtn = backdrop.querySelector('[data-act="cancel"]');
      const okBtn = backdrop.querySelector('[data-act="ok"]');
      cancelBtn.textContent = cancelText;
      okBtn.textContent = confirmText;

      const close = (result) => {
        document.removeEventListener('keydown', onKey, true);
        backdrop.remove();
        this._confirmOpen = false;
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
        resolve(result);
      };

      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); }
        else if (e.key === 'Tab') {
          // 焦点只在两个按钮间循环
          e.preventDefault();
          (document.activeElement === okBtn ? cancelBtn : okBtn).focus();
        }
      };

      cancelBtn.addEventListener('click', () => close(false));
      okBtn.addEventListener('click', () => close(true));
      backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close(false); });
      document.addEventListener('keydown', onKey, true);

      document.body.appendChild(backdrop);
      if (window.lucide) lucide.createIcons();
      // 危险操作默认聚焦"取消",防止误按 Enter
      (danger ? cancelBtn : okBtn).focus();
    });
  },

  /** 统一空状态 HTML。action: { text, onclick } 可选 */
  empty({ icon = 'inbox', title = '暂无数据', hint = '', action = null, compact = false } = {}) {
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = compact ? 'py-6' : 'py-12';
    return `
      <div class="flex flex-col items-center justify-center text-center ${pad} px-4 select-none">
        <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <i data-lucide="${esc(icon)}" class="w-5 h-5 text-slate-400"></i>
        </div>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">${esc(title)}</p>
        ${hint ? `<p class="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">${esc(hint)}</p>` : ''}
        ${action ? `<button type="button" onclick="${esc(action.onclick)}" class="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">${esc(action.text)}</button>` : ''}
      </div>`;
  },
};
