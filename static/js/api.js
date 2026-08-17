// API Client for Job Copilot
const API = {
  // Jobs API
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/jobs/?${query}`);
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

  // Interviews API
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

  // Resumes API
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

  // Job Search & Parser API
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

  // AI Assistant API
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

  async extractSkills(text) {
    const res = await fetch('/api/ai/extract-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  }
};
