class TrendsVisualization {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.charts = {};
    this.currentData = null;
    this.filters = {
      category: 'all',
      timeRange: '30d',
      sortBy: 'popularity'
    };
    
    this.setupDashboard();
  }
  
  setupDashboard() {
    this.container.innerHTML = `
      <div class="trends-dashboard">
        <div class="dashboard-header">
          <h2>Technology Trends Dashboard</h2>
          <div class="dashboard-controls">
            <select id="category-filter" class="filter-select">
              <option value="all">All Categories</option>
              <option value="language">Programming Languages</option>
              <option value="framework">Frameworks</option>
              <option value="tool">Tools</option>
              <option value="job_role">Job Roles</option>
            </select>
            
            <select id="time-range-filter" class="filter-select">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button id="refresh-data" class="refresh-btn">Refresh Data</button>
          </div>
        </div>
        
        <div class="charts-grid">
          <div class="chart-container large">
            <h3>Technology Popularity Overview</h3>
            <canvas id="popularity-chart"></canvas>
          </div>
          
          <div class="chart-container medium">
            <h3>Growth Trends</h3>
            <canvas id="growth-chart"></canvas>
          </div>
          
          <div class="chart-container medium">
            <h3>Job Market Demand</h3>
            <canvas id="demand-chart"></canvas>
          </div>
          
          <div class="chart-container large">
            <h3>Technology Timeline</h3>
            <canvas id="timeline-chart"></canvas>
          </div>
          
          <div class="chart-container full-width">
            <h3>Skills Heatmap</h3>
            <div id="heatmap-container"></div>
          </div>
        </div>
        
        <div class="trends-insights">
          <h3>Key Insights</h3>
          <div id="insights-content"></div>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  async renderDashboard(data) {
    this.currentData = data;
    
    await Promise.all([
      this.renderPopularityChart(data),
      this.renderGrowthChart(data),
      this.renderDemandChart(data),
      this.renderTimelineChart(data),
      this.renderHeatmap(data)
    ]);
    
    this.generateInsights(data);
  }
  
  renderPopularityChart(data) {
    const ctx = document.getElementById('popularity-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (this.charts.popularity) {
      this.charts.popularity.destroy();
    }
    
    const filteredData = this.applyFilters(data);
    const sortedData = filteredData
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, 15);
    
    this.charts.popularity = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sortedData.map(item => item.technology),
        datasets: [{
          data: sortedData.map(item => item.popularity_score),
          backgroundColor: this.generateGradientColors(sortedData.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = sortedData[context.dataIndex];
                return [
                  `${item.technology}: ${item.popularity_score.toFixed(1)}`,
                  `GitHub Stars: ${item.github_stars?.toLocaleString() || 'N/A'}`,
                  `SO Questions: ${item.stackoverflow_questions?.toLocaleString() || 'N/A'}`
                ];
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1500
        }
      }
    });
  }
  
  renderGrowthChart(data) {
    const ctx = document.getElementById('growth-chart').getContext('2d');
    
    if (this.charts.growth) {
      this.charts.growth.destroy();
    }
    
    const filteredData = this.applyFilters(data);
    const growthData = filteredData
      .filter(item => item.growth_rate > 0)
      .sort((a, b) => b.growth_rate - a.growth_rate)
      .slice(0, 10);
    
    this.charts.growth = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: growthData.map(item => item.technology),
        datasets: [{
          label: 'Growth Rate (%)',
          data: growthData.map(item => item.growth_rate * 100),
          backgroundColor: growthData.map(item => 
            item.growth_rate > 0.5 ? '#10B981' : 
            item.growth_rate > 0.2 ? '#F59E0B' : '#EF4444'
          ),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = growthData[context.dataIndex];
                return [
                  `Growth: ${(item.growth_rate * 100).toFixed(1)}%`,
                  `Market Momentum: ${item.market_momentum?.toFixed(2) || 'N/A'}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Growth Rate (%)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45
            }
          }
        }
      }
    });
  }
  
  renderTimelineChart(data) {
    const ctx = document.getElementById('timeline-chart').getContext('2d');
    
    if (this.charts.timeline) {
      this.charts.timeline.destroy();
    }
    
    // This would typically use historical data
    // For now, we'll simulate timeline data
    const timelineData = this.generateTimelineData(data);
    
    this.charts.timeline = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: timelineData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM YYYY'
              }
            },
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Popularity Score'
            }
          }
        }
      }
    });
  }
  
  generateInsights(data) {
    const insights = this.analyzeData(data);
    const container = document.getElementById('insights-content');
    
    container.innerHTML = `
      <div class="insights-grid">
        <div class="insight-card trending">
          <h4>🚀 Trending Technologies</h4>
          <ul>
            ${insights.trending.map(tech => 
              `<li>${tech.technology} <span class="growth">+${(tech.growth_rate * 100).toFixed(1)}%</span></li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="insight-card declining">
          <h4>📉 Declining Technologies</h4>
          <ul>
            ${insights.declining.map(tech => 
              `<li>${tech.technology} <span class="decline">${(tech.growth_rate * 100).toFixed(1)}%</span></li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="insight-card opportunities">
          <h4>💡 Learning Opportunities</h4>
          <ul>
            ${insights.opportunities.map(tech => 
              `<li>${tech.technology} - ${tech.reason}</li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="insight-card market">
          <h4>📊 Market Summary</h4>
          <p>Total technologies tracked: <strong>${data.length}</strong></p>
          <p>Average growth rate: <strong>${insights.averageGrowth.toFixed(1)}%</strong></p>
          <p>Most active category: <strong>${insights.mostActiveCategory}</strong></p>
        </div>
      </div>
    `;
  }
}