// Interview Calendar & Desktop Notifications
const InterviewCalendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  interviewsData: [],

  async init() {
    this.requestNotificationPermission();
    await this.loadAllInterviews();
    this.render();
  },

  requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  },

  async loadAllInterviews() {
    try {
      this.interviewsData = await API.getAllInterviews();
      this.checkUpcomingAlerts();
    } catch (e) {
      console.error("加载日历面试数据失败", e);
    }
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  },

  today() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.render();
  },

  render() {
    const titleEl = document.getElementById('cal-month-title');
    if (titleEl) {
      titleEl.innerText = `${this.currentYear} 年 ${this.currentMonth + 1} 月`;
    }

    this.renderGrid();
    this.renderTimeline();
    lucide.createIcons();
  },

  renderGrid() {
    const gridContainer = document.getElementById('calendar-grid');
    if (!gridContainer) return;

    const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

    let html = '';

    // 星期表头
    const weekHeaders = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    html += weekHeaders.map(w => `
      <div class="py-2 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">${w}</div>
    `).join('');

    // 上个月剩余天数
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = daysInPrevMonth - i;
      html += `
        <div class="min-h-[100px] p-1.5 bg-slate-950/40 border border-slate-800/40 opacity-40 text-xs">
          <span class="text-slate-500 font-mono">${prevDate}</span>
        </div>
      `;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 当月天数
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(this.currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${this.currentYear}-${monthStr}-${dayStr}`;
      const isToday = dateKey === todayStr;

      // 匹配该日期的面试
      const dayInterviews = this.interviewsData.filter(item => {
        return item.interview_time && item.interview_time.startsWith(dateKey);
      });

      html += `
        <div class="cal-day-cell min-h-[105px] p-2 bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between ${isToday ? 'ring-1 ring-blue-500 bg-blue-950/20' : ''}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold font-mono ${isToday ? 'text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded-full' : 'text-slate-900 dark:text-slate-300'}">${day}</span>
            ${dayInterviews.length > 0 ? `<span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">${dayInterviews.length}场面试</span>` : ''}
          </div>

          <div class="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
            ${dayInterviews.map(item => `
              <div onclick="App.openJobDetailModal(${item.job_id})" class="p-1 rounded bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] cursor-pointer transition-all">
                <div class="font-semibold text-amber-300 truncate">${Kanban.escapeHtml(item.job_company)}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${Kanban.escapeHtml(item.round_name)} (${Kanban.escapeHtml(item.interview_time.split(' ')[1] || '')})</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    gridContainer.innerHTML = html;
  },

  renderTimeline() {
    const listContainer = document.getElementById('upcoming-interviews-timeline');
    if (!listContainer) return;

    // 过滤出未来或近期的面试并按时间排序
    const sorted = [...this.interviewsData]
      .filter(item => Boolean(item.interview_time))
      .sort((a, b) => a.interview_time.localeCompare(b.interview_time));

    if (sorted.length === 0) {
      listContainer.innerHTML = `
        <div class="py-8 text-center text-slate-500 text-xs">
          <i data-lucide="calendar-x" class="w-8 h-8 mx-auto mb-2 text-slate-600"></i>
          暂无已安排的面试日程。收到面试通知后，可以在岗位详情中添加面试轮次！
        </div>
      `;
      return;
    }

    const now = new Date();

    listContainer.innerHTML = sorted.map(item => {
      const interviewDate = new Date(item.interview_time.replace(/-/g, '/'));
      const diffMs = interviewDate - now;
      const isPast = diffMs < 0;
      
      let countdownText = "";
      if (isPast) {
        countdownText = `<span class="text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">已结束</span>`;
      } else {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        const remHours = diffHours % 24;
        countdownText = `
          <span class="text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
            倒计时 ${diffDays > 0 ? `${diffDays}天` : ''}${remHours}小时
          </span>
        `;
      }

      return `
        <div class="p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <i data-lucide="video" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">${Kanban.escapeHtml(item.job_company)}</h4>
                <span class="text-xs text-slate-500 dark:text-slate-400">· ${Kanban.escapeHtml(item.job_title)}</span>
              </div>
              <p class="text-xs text-amber-300 font-semibold mt-0.5">${Kanban.escapeHtml(item.round_name)} · ⏰ ${Kanban.escapeHtml(item.interview_time)}</p>
              ${item.meeting_link ? `<p class="text-[11px] text-blue-400 mt-1 truncate max-w-md">📍 ${Kanban.escapeHtml(item.meeting_link)}</p>` : ''}
            </div>
          </div>

          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            ${countdownText}
            <button onclick="App.openJobDetailModal(${item.job_id})" class="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors">
              <span>查看复盘/JD</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  checkUpcomingAlerts() {
    const now = new Date();
    let notifiedSet = new Set();
    try {
      notifiedSet = new Set(JSON.parse(sessionStorage.getItem('notified_interviews') || '[]'));
    } catch (e) {}

    const hasNotificationSupport = ("Notification" in window) && Notification.permission === "granted";

    this.interviewsData.forEach(item => {
      if (!item.interview_time || notifiedSet.has(item.id)) return;
      const targetTime = new Date(item.interview_time.replace(/-/g, '/'));
      const diffMinutes = (targetTime - now) / (1000 * 60);

      if (diffMinutes > 0 && diffMinutes <= 60) {
        // 1小时内紧急面试
        const msg = `⏰ 面试即将开始: 您将在 ${Math.ceil(diffMinutes)} 分钟后参加【${item.job_company} - ${item.round_name}】！`;
        if (hasNotificationSupport) {
          try {
            new Notification(`⏰ 面试倒计时: ${item.job_company}`, {
              body: msg + `\n会议/地点: ${item.meeting_link || '请准备好设备与自我介绍'}`,
              icon: '/static/favicon.ico'
            });
          } catch (err) {}
        }
        if (window.App && App.showToast) {
          App.showToast(msg, 'warning');
        }
        notifiedSet.add(item.id);
      } else if (diffMinutes > 0 && diffMinutes <= 1440 && targetTime.getDate() === now.getDate()) {
        // 今日面试安排提醒
        const msg = `📅 今日面试安排: ${item.job_company}【${item.round_name}】时间为 ${item.interview_time}`;
        if (hasNotificationSupport) {
          try {
            new Notification(`📅 今日面试日程`, {
              body: msg,
              icon: '/static/favicon.ico'
            });
          } catch (err) {}
        }
        notifiedSet.add(item.id);
      }
    });

    try {
      sessionStorage.setItem('notified_interviews', JSON.stringify(Array.from(notifiedSet)));
    } catch (e) {}
  }
};
