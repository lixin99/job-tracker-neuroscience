const fs = require('fs');
const path = require('path');

// 模拟从多个招聘网站抓取数据
async function fetchJobData() {
  // 这里应该是实际的爬虫代码
  // 现在使用模拟数据
  const newJobs = [
    {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      unit: '深圳医学科学院 - 神经调控中心',
      location: '广东',
      position: '研究员',
      requirements: '超声神经调控、电生理、动物行为学',
      url: 'https://www.smart.org.cn/careers/researcher_new',
      type: 'research'
    }
  ];
  
  return newJobs;
}

// 更新数据文件
async function updateJobData() {
  try {
    const dataPath = path.join(__dirname, '../data/jobs.json');
    const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const newJobs = await fetchJobData();
    const updatedJobs = {
      last_updated: new Date().toLocaleString('zh-CN'),
      jobs: [...newJobs, ...existingData.jobs.slice(0, 20)] // 保留最新20条
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(updatedJobs, null, 2));
    console.log('数据更新成功！');
  } catch (error) {
    console.error('更新失败:', error);
  }
}

updateJobData();
