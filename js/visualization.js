class JobVisualization {
    constructor() {
        this.jobData = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderStats();
        this.renderCharts();
    }

    async loadData() {
        try {
            const response = await fetch('data/jobs.json');
            const data = await response.json();
            this.jobData = data.jobs;
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }

    renderStats() {
        // 基础统计
        document.getElementById('totalJobs').textContent = this.jobData.length;

        // 本周新增
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyJobs = this.jobData.filter(job => new Date(job.date) >= oneWeekAgo);
        document.getElementById('weeklyJobs').textContent = weeklyJobs.length;

        // 地区统计
        const regionCount = this.jobData.reduce((acc, job) => {
            acc[job.location] = (acc[job.location] || 0) + 1;
            return acc;
        }, {});
        const topRegion = Object.entries(regionCount).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('topRegion').textContent = topRegion ? topRegion[0] : '-';

        // 类型统计
        const typeCount = this.jobData.reduce((acc, job) => {
            acc[job.type] = (acc[job.type] || 0) + 1;
            return acc;
        }, {});
        const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
        document.getElementById('topType').textContent = topType ? this.getTypeName(topType[0]) : '-';
    }

    getTypeName(type) {
        const typeMap = {
            'research': '研究院所',
            'hospital': '医院',
            'university': '高校',
            'enterprise': '企业'
        };
        return typeMap[type] || type;
    }

    renderCharts() {
        this.renderRegionChart();
        this.renderResearchChart();
        this.renderTrendChart();
        this.renderTypeChart();
        this.renderWordCloud();
    }

    renderRegionChart() {
        const ctx = document.getElementById('regionChart').getContext('2d');
        const regionData = this.countByField('location');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(regionData),
                datasets: [{
                    data: Object.values(regionData),
                    backgroundColor: ['#28a745', '#fd7e14', '#e83e8c', '#6f42c1']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    renderResearchChart() {
        const ctx = document.getElementById('researchChart').getContext('2d');
        
        // 分析研究方向关键词
        const keywords = ['超声神经调控', '神经电生理', '神经调控', '脑机接口', '神经界面'];
        const keywordCount = {};
        
        keywords.forEach(keyword => {
            keywordCount[keyword] = this.jobData.filter(job => 
                job.requirements.includes(keyword) || job.position.includes(keyword)
            ).length;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(keywordCount),
                datasets: [{
                    label: '岗位数量',
                    data: Object.values(keywordCount),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    renderTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // 按月份统计
        const monthlyData = {};
        this.jobData.forEach(job => {
            const month = job.date.substring(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: '月度岗位数',
                    data: sortedMonths.map(month => monthlyData[month]),
                    borderColor: '#764ba2',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    renderTypeChart() {
        const chart = echarts.init(document.getElementById('typeChart'));
        const typeData = this.countByField('type');
        
        const option = {
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                data: Object.entries(typeData).map(([name, value]) => ({
                    name: this.getTypeName(name),
                    value: value
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        
        chart.setOption(option);
    }

    renderWordCloud() {
        const chart = echarts.init(document.getElementById('wordCloud'));
        
        // 提取关键词频率
        const text = this.jobData.map(job => 
            job.requirements + ' ' + job.position
        ).join(' ');
        
        const words = this.analyzeKeywords(text);
        
        const option = {
            tooltip: {},
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                sizeRange: [12, 60],
                rotationRange: [-90, 90],
                gridSize: 8,
                drawOutOfBound: false,
                textStyle: {
                    color: function () {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                data: words
            }]
        };
        
        chart.setOption(option);
    }

    analyzeKeywords(text) {
        const keywordWeights = {
            '超声神经调控': 10, '神经电生理': 9, '神经调控': 8, 
            '脑机接口': 9, '神经界面': 8, '电生理': 7, '脑科学': 6,
            '神经工程': 7, '生物医学': 6, '信号处理': 5, '动物实验': 5
        };
        
        return Object.entries(keywordWeights).map(([name, value]) => ({
            name,
            value,
            textStyle: { }
        }));
    }

    countByField(field) {
        return this.jobData.reduce((acc, job) => {
            acc[job[field]] = (acc[job[field]] || 0) + 1;
            return acc;
        }, {});
    }
}

// 初始化可视化
new JobVisualization();
