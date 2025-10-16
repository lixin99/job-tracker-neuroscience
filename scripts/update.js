const fs = require('fs');
const path = require('path');
const { fetchRealJobData } = require('./advanced_crawler');

// 更新数据文件
async function updateJobData() {
    try {
        const dataPath = path.join(__dirname, '../data/jobs.json');
        
        console.log('开始更新招聘数据...');
        
        // 读取现有数据
        let existingData;
        try {
            existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            console.log(`现有数据量: ${existingData.jobs.length} 条记录`);
        } catch (error) {
            // 如果文件不存在或格式错误，初始化数据
            existingData = { last_updated: '', jobs: [] };
            console.log('初始化新的数据文件');
        }
        
        // 获取真实招聘数据
        const newJobs = await fetchRealJobData();
        
        // 合并数据（去重）
        const existingIds = new Set(existingData.jobs.map(job => job.id));
        const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
        
        console.log(`新增岗位: ${uniqueNewJobs.length} 个`);
        
        // 更新数据
        const updatedJobs = {
            last_updated: new Date().toLocaleString('zh-CN'),
            jobs: [...uniqueNewJobs, ...existingData.jobs].slice(0, 100) // 保留最新100条
        };
        
        // 保存数据
        fs.writeFileSync(dataPath, JSON.stringify(updatedJobs, null, 2));
        console.log(`数据更新成功！总计 ${updatedJobs.jobs.length} 条记录`);
        
        return uniqueNewJobs;
        
    } catch (error) {
        console.error('更新失败:', error);
        return [];
    }
}

// 如果直接运行此文件
if (require.main === module) {
    updateJobData().then(newJobs => {
        if (newJobs.length > 0) {
            console.log(`🎉 发现 ${newJobs.length} 个新岗位`);
            newJobs.forEach(job => {
                console.log(`   - ${job.unit}: ${job.position}`);
            });
        } else {
            console.log('ℹ️  没有发现新岗位');
        }
        process.exit(0);
    }).catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = { updateJobData };
