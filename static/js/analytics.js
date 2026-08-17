// Analytics and Visualization
const Analytics = {
  statusChart: null,
  sourceChart: null,

  async init() {
    await this.renderCharts();
  },

  async renderCharts() {
    try {
      const stats = await API.getStats();
      
      // Update Stat Badges
      document.getElementById('stat-total-jobs').innerText = stats.total || 0;
      document.getElementById('stat-active-jobs').innerText = stats.active_in_process || 0;
      document.getElementById('stat-interview-jobs').innerText = stats.status_counts?.interview || 0;
      document.getElementById('stat-offer-jobs').innerText = stats.status_counts?.offer || 0;
      document.getElementById('stat-response-rate').innerText = stats.response_rate || '0%';

      // 1. Status Donut Chart
      const statusCtx = document.getElementById('chart-status');
      if (statusCtx) {
        if (this.statusChart) this.statusChart.destroy();
        
        const labels = ['意向待投', '已投递', '初筛/笔试', '面试中', '已获 Offer', '未通过/归档'];
        const data = [
          stats.status_counts.wishlist || 0,
          stats.status_counts.applied || 0,
          stats.status_counts.screening || 0,
          stats.status_counts.interview || 0,
          stats.status_counts.offer || 0,
          stats.status_counts.rejected || 0
        ];

        this.statusChart = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: [
                '#64748b', // Slate
                '#3b82f6', // Blue
                '#a855f7', // Purple
                '#f59e0b', // Amber
                '#10b981', // Emerald
                '#f43f5e'  // Rose
              ],
              borderWidth: 2,
              borderColor: '#0f172a'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', boxWidth: 12, padding: 15, font: { size: 11 } }
              }
            },
            cutout: '68%'
          }
        });
      }

      // 2. Source Bar Chart
      const sourceCtx = document.getElementById('chart-source');
      if (sourceCtx) {
        if (this.sourceChart) this.sourceChart.destroy();

        const sourceLabels = Object.keys(stats.source_counts || {});
        const sourceData = Object.values(stats.source_counts || {});

        this.sourceChart = new Chart(sourceCtx, {
          type: 'bar',
          data: {
            labels: sourceLabels.length > 0 ? sourceLabels : ['暂无渠道数据'],
            datasets: [{
              label: '岗位数量',
              data: sourceData.length > 0 ? sourceData : [0],
              backgroundColor: '#3b82f6',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#64748b' },
                grid: { color: '#1e293b' }
              },
              x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    } catch (e) {
      console.error("加载统计图表失败", e);
    }
  }
};
