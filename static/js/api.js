// API Client for Job Copilot (v2.0 Extended)
const API = {
  async getJobs(params = {}) {
    const cleanParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== null && val !== undefined && val !== '' && val !== 'all' && val !== 'null' && val !== 'undefined') {
        cleanParams.append(key, val);
      }
    }
    const query = cleanParams.toString();
    const res = await fetch(`/api/jobs/${query ? '?' + query : ''}`);
    return await res.json();
  },

  async getJob(id) {
    const res = await fetch(`/api/jobs/${id}`);
    return await res.json();
  },

  async createJob(data) {
    const res = await fetch('/api/jobs/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateJob(id, data) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteJob(id) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async getStats() {
    const res = await fetch('/api/jobs/stats/summary');
    return await res.json();
  },

  async getGroupsSummary() {
    const res = await fetch('/api/jobs/groups/summary');
    return await res.json();
  },

  async batchUpdateGroupStatus(groupName, fromStatus = 'wishlist', toStatus = 'applied') {
    const res = await fetch('/api/jobs/groups/batch-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_name: groupName, from_status: fromStatus, to_status: toStatus })
    });
    return await res.json();
  },

  async batchAssignJobsGroup(jobIds, targetGroup, targetResumeVersion = null) {
    const res = await fetch('/api/jobs/groups/batch-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_ids: jobIds,
        target_group: targetGroup,
        target_resume_version: targetResumeVersion
      })
    });
    return await res.json();
  },

  // ================= Interviews API =================
  async getAllInterviews() {
    const res = await fetch('/api/interviews/');
    return await res.json();
  },

  async getInterviews(jobId) {
    const res = await fetch(`/api/interviews/by-job/${jobId}`);
    return await res.json();
  },

  async createInterview(data) {
    const res = await fetch('/api/interviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateInterview(id, data) {
    const res = await fetch(`/api/interviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteInterview(id) {
    const res = await fetch(`/api/interviews/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // ================= Resumes & PDF Upload API =================
  async getResumes() {
    const res = await fetch('/api/resumes/');
    return await res.json();
  },

  async createResume(data) {
    const res = await fetch('/api/resumes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async uploadPDF(formData) {
    const res = await fetch('/api/resumes/upload-pdf', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'PDF 解析失败');
    }
    return await res.json();
  },

  async updateResume(id, data) {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteResume(id) {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // ================= Offers API =================
  async getOffers() {
    const res = await fetch('/api/offers/');
    return await res.json();
  },

  async getOffer(id) {
    const res = await fetch(`/api/offers/${id}`);
    return await res.json();
  },

  async getOfferComparisons() {
    const res = await fetch('/api/offers/compare/all');
    return await res.json();
  },

  async createOffer(data) {
    const res = await fetch('/api/offers/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateOffer(id, data) {
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteOffer(id) {
    const res = await fetch(`/api/offers/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // ================= Job Search & Parser API =================
  async searchJobs(keyword = '', source = 'all') {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (source) params.append('source', source);
    const res = await fetch(`/api/search/jobs?${params.toString()}`);
    return await res.json();
  },

  async parseUrl(url) {
    const res = await fetch(`/api/search/parse-url?url=${encodeURIComponent(url)}`);
    return await res.json();
  },

  // ================= AI Assistant & LLM Settings API =================
  async getLLMSettings() {
    const res = await fetch('/api/settings/llm');
    return await res.json();
  },

  async saveLLMSettings(data) {
    const res = await fetch('/api/settings/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async testLLMConnection(data) {
    const res = await fetch('/api/settings/test-llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async matchJd(jdText, resumeText) {
    const res = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text: jdText, resume_text: resumeText })
    });
    return await res.json();
  },

  async predictQuestions(title, jdText) {
    const res = await fetch('/api/ai/predict-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, jd_text: jdText })
    });
    return await res.json();
  },

  async tailorResume(resumeText, jdText) {
    const res = await fetch('/api/ai/tailor-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, jd_text: jdText })
    });
    return await res.json();
  },

  async mockInterviewTurn(history, jdText, candidateAnswer) {
    const res = await fetch('/api/ai/mock-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, jd_text: jdText, candidate_answer: candidateAnswer })
    });
    return await res.json();
  },

  // ================= Campus Radar API =================
  async getCampusRecruits(filters = {}) {
    const params = new URLSearchParams();
    if (filters.industry && filters.industry !== 'all') params.append('industry', filters.industry);
    if (filters.recruitment_type && filters.recruitment_type !== 'all') params.append('recruitment_type', filters.recruitment_type);
    if (filters.target_graduates && filters.target_graduates !== 'all') params.append('target_graduates', filters.target_graduates);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.keyword && filters.keyword.trim()) params.append('keyword', filters.keyword.trim());

    const res = await fetch(`/api/campus/?${params.toString()}`);
    return await res.json();
  },

  async getCampusStats() {
    const res = await fetch('/api/campus/stats');
    return await res.json();
  },

  async syncCampusRecruits() {
    const res = await fetch('/api/campus/sync', {
      method: 'POST'
    });
    return await res.json();
  },

  async importCampusToJob(recruitId, role = null) {
    const url = role 
      ? `/api/campus/import-to-job/${recruitId}?role=${encodeURIComponent(role)}`
      : `/api/campus/import-to-job/${recruitId}`;
    const res = await fetch(url, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || '导入失败');
    }
    return await res.json();
  },

  async getCompanyAllPositions(companyName) {
    const res = await fetch(`/api/campus/company-all-positions?company_name=${encodeURIComponent(companyName)}`);
    return await res.json();
  },

  async parseCampusArticle(articleText, sourceUrl = '') {
    const res = await fetch('/api/campus/parse-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_text: articleText, source_url: sourceUrl })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || '提取失败');
    }
    return await res.json();
  },

  async createCampusRecruit(data) {
    const res = await fetch('/api/campus/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateCampusRecruit(id, data) {
    const res = await fetch(`/api/campus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteCampusRecruit(id) {
    const res = await fetch(`/api/campus/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async purgeCampusRecruits() {
    const res = await fetch('/api/campus/purge/all', {
      method: 'DELETE'
    });
    return await res.json();
  },

  // ==================== 考公考编与央国企专区 API ====================
  async getPublicRecruits(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.region && params.region !== 'all') query.append('region', params.region);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.keyword) query.append('keyword', params.keyword);

    const res = await fetch(`/api/public-sector/?${query.toString()}`);
    return await res.json();
  },

  async getPublicStats() {
    const res = await fetch('/api/public-sector/stats');
    return await res.json();
  },

  async syncPublicRecruits() {
    const res = await fetch('/api/public-sector/sync', { method: 'POST' });
    return await res.json();
  },

  async importPublicRecruitToJob(id) {
    const res = await fetch(`/api/public-sector/import-to-job/${id}`, { method: 'POST' });
    return await res.json();
  },

  async parsePublicRecruitArticle(articleText, sourceUrl = '') {
    const res = await fetch('/api/public-sector/parse-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_text: articleText, source_url: sourceUrl })
    });
    return await res.json();
  },

  async purgePublicRecruits() {
    const res = await fetch('/api/public-sector/purge/all', { method: 'DELETE' });
    return await res.json();
  },

  async deletePublicRecruit(id) {
    const res = await fetch(`/api/public-sector/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  // ==================== 全站数据管理与备份恢复 API ====================
  async purgeAllData() {
    const res = await fetch('/api/settings/purge-all-data', { method: 'DELETE' });
    return await res.json();
  },

  getBackupDBUrl() {
    return '/api/settings/backup-db';
  },

  async restoreDatabase(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/settings/restore-db', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: '网络请求错误' }));
      throw new Error(err.detail || '数据库恢复失败');
    }
    return await res.json();
  },

  async exportJSONBackup() {
    const res = await fetch('/api/settings/export-json');
    return await res.json();
  },

  // ==================== 企业背调与全景画像 API ====================
  async searchCompanies(query = '') {
    const res = await fetch(`/api/company/search?query=${encodeURIComponent(query)}`);
    return await res.json();
  },

  async getCompanyProfile(name) {
    const res = await fetch(`/api/company/profile?name=${encodeURIComponent(name)}`);
    return await res.json();
  },

  async runAICompanyResearch(companyName, jobTitle = '') {
    const res = await fetch('/api/company/ai-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: companyName, job_title: jobTitle })
    });
    return await res.json();
  },

  // ==================== 全网实时动态校招检索 API ====================
  async liveSearchCampus(keyword) {
    const res = await fetch(`/api/campus/live-search?keyword=${encodeURIComponent(keyword)}`);
    return await res.json();
  },

  async importLiveCampusRecruit(data) {
    const res = await fetch('/api/campus/import-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
};




