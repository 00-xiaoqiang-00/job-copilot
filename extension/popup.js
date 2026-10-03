document.addEventListener('DOMContentLoaded', async () => {
  const saveBtn = document.getElementById('save-btn');
  const msgEl = document.getElementById('msg');

  // 1. 获取当前活动 Tab 并注入 content.js 提取页面信息
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      if (results && results[0] && results[0].result) {
        const job = results[0].result;
        document.getElementById('title').value = job.title || "";
        document.getElementById('company').value = job.company || "";
        document.getElementById('salary').value = job.salary || "面议";
        document.getElementById('location').value = job.location || "全国/远程";
        document.getElementById('source').value = job.source || "网页采集";
        document.getElementById('source_url').value = job.source_url || tab.url;
        document.getElementById('jd_text').value = job.jd_text || "";
      }
    }
  } catch (err) {
    console.error("提取页面信息失败", err);
  }

  // 2. 点击保存向本地 FastAPI 发送 POST 请求
  saveBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    const company = document.getElementById('company').value.trim();

    if (!title || !company) {
      msgEl.innerText = "请填写岗位名称与公司名称";
      msgEl.className = "error";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "正在同步到本地...";
    msgEl.innerText = "";

    const payload = {
      title: title,
      company: company,
      salary: document.getElementById('salary').value.trim(),
      location: document.getElementById('location').value.trim(),
      source: document.getElementById('source').value.trim(),
      source_url: document.getElementById('source_url').value.trim(),
      status: document.getElementById('status').value,
      jd_text: document.getElementById('jd_text').value.trim(),
      priority: 2,
      resume_version: "默认通用简历"
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/jobs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        msgEl.innerText = "🎉 成功录入到 Job Copilot 本地看板！";
        msgEl.className = "success";
        saveBtn.innerText = "已保存";
        setTimeout(() => window.close(), 1500);
      } else {
        const errJson = await res.json();
        throw new Error(errJson.detail || "保存失败");
      }
    } catch (e) {
      msgEl.innerText = "连接本地失败: 请确保 Job Copilot 已启动 (127.0.0.1:8000)";
      msgEl.className = "error";
      saveBtn.disabled = false;
      saveBtn.innerText = "重新保存";
    }
  });
});
