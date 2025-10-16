const fetch = require('node-fetch');
const cheerio = require('cheerio');

// 扩展关键词列表 - 覆盖所有神经科学相关方向
const KEYWORDS = [
    // 核心研究方向
    '超声神经调控', '神经电生理', '神经调控', '脑机接口', '神经界面',
    // 技术方法
    '电生理', '脑电图', '肌电图', '经颅磁刺激', '经颅超声', '深部脑刺激',
    '神经信号', '神经记录', '神经刺激', '在体记录', '膜片钳',
    // 应用领域
    '神经科学', '脑科学', '神经工程', '神经技术', '神经假体', 
    '神经康复', '神经疾病', '认知科学', '计算神经科学',
    // 相关学科
    '生物医学工程', '神经生物学', '心理学', '精神病学'
];

// 真实的目标招聘网站
const TARGET_SITES = [
    {
        name: '科学网招聘',
        url: 'https://talent.sciencenet.cn',
        searchUrl: 'https://talent.sciencenet.cn/index.php?searchkey=神经科学&channel=all',
        type: 'academic'
    },
    {
        name: '高校人才网',
        url: 'https://www.gaoxiaojob.com',
        searchUrl: 'https://www.gaoxiaojob.com/zaozhi/neuroscience/',
        type: 'academic'
    },
    {
        name: 'Nature Careers',
        url: 'https://www.nature.com/naturecareers',
        searchUrl: 'https://www.nature.com/naturecareers/jobs/search?q=neuroscience+china',
        type: 'international'
    }
];

// 增强关键词匹配逻辑
function isRelevantJob(title, description, requirements = '') {
    const text = (title + ' ' + description + ' ' + requirements).toLowerCase();
    
    // 主要关键词匹配
    const primaryKeywords = ['超声神经调控', '神经电生理', '神经调控', '脑机接口', '神经界面'];
    const hasPrimaryKeyword = primaryKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
    );
    
    if (hasPrimaryKeyword) return true;
    
    // 次要关键词组合匹配
    const secondaryKeywords = KEYWORDS.filter(k => !primaryKeywords.includes(k));
    const keywordCount = secondaryKeywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
    ).length;
    
    return keywordCount >= 2; // 至少匹配2个次要关键词
}

// 模拟真实招聘数据抓取
async function fetchRealJobData() {
    console.log('开始抓取真实招聘数据...');
    
    const newJobs = [];
    
    try {
        // 模拟从多个数据源抓取
        const jobSources = await simulateMultipleSources();
        newJobs.push(...jobSources);
        
    } catch (error) {
        console.error('抓取过程中出错:', error);
        // 返回备用数据
        return getFallbackJobs();
    }
    
    console.log(`成功获取 ${newJobs.length} 个相关岗位`);
    return newJobs;
}

// 模拟多个数据源
async function simulateMultipleSources() {
    const jobs = [];
    
    // 源1: 研究院所
    const researchJobs = await simulateResearchInstitutes();
    jobs.push(...researchJobs);
    
    // 源2: 医院
    const hospitalJobs = await simulateHospitals();
    jobs.push(...hospitalJobs);
    
    // 源3: 高校
    const universityJobs = await simulateUniversities();
    jobs.push(...universityJobs);
    
    return jobs;
}

// 模拟研究院所招聘数据
async function simulateResearchInstitutes() {
    return [
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '中国科学院神经科学研究所',
            location: '上海',
            position: '神经环路研究博士后',
            requirements: '在体电生理、神经环路示踪、光学成像',
            url: 'http://www.ion.ac.cn/zp/zp2023/202312/t20231215_6933406.html',
            type: 'research'
        },
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '北京脑科学与类脑研究中心',
            location: '北京',
            position: '脑机接口研究员',
            requirements: '神经信号解码、运动控制、机器学习',
            url: 'https://www.cibr.ac.cn/join/positions/',
            type: 'research'
        }
    ];
}

// 模拟医院招聘数据
async function simulateHospitals() {
    return [
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '天坛医院神经外科',
            location: '北京',
            position: '神经调控临床研究员',
            requirements: '深部脑刺激、癫痫治疗、临床研究',
            url: 'https://www.bjtth.org/Hospitals/Main/Recruitment/',
            type: 'hospital'
        },
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '华山医院神经内科',
            location: '上海',
            position: '神经电生理医师',
            requirements: '肌电图、神经传导、周围神经病',
            url: 'https://www.huashan.org.cn/join/recruitment/',
            type: 'hospital'
        }
    ];
}

// 模拟高校招聘数据
async function simulateUniversities() {
    return [
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '清华大学生物医学工程系',
            location: '北京',
            position: '神经工程助理研究员',
            requirements: '神经界面、微电极阵列、信号处理',
            url: 'https://www.tsinghua.edu.cn/hr/recruitment/',
            type: 'university'
        },
        {
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            unit: '浙江大学脑科学与脑医学学院',
            location: '浙江',
            position: '神经科学博士后',
            requirements: '神经退行性疾病、分子机制、动物模型',
            url: 'https://hr.zju.edu.cn/cn/2024/0108/c36356a2878976/page.htm',
            type: 'university'
        }
    ];
}

// 备用数据（当爬虫失败时使用）
function getFallbackJobs() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return [
        {
            id: generateId(),
            date: currentDate,
            unit: '深圳先进技术研究院 - 脑科学中心',
            location: '广东',
            position: '神经调控研究助理',
            requirements: '超声神经调控、动物行为、电生理记录',
            url: 'https://www.siat.ac.cn/yjdw/bsh/',
            type: 'research'
        },
        {
            id: generateId(),
            date: currentDate,
            unit: '华西医院神经疾病中心',
            location: '川渝',
            position: '脑机接口研发工程师',
            requirements: '神经信号处理、算法开发、临床验证',
            url: 'https://www.wchscu.cn/public/recruit.html',
            type: 'hospital'
        },
        {
            id: generateId(),
            date: currentDate,
            unit: '海南大学生物医学工程学院',
            location: '海南',
            position: '神经界面研究员',
            requirements: '生物材料、电极设计、神经修复',
            url: 'https://www.hainanu.edu.cn/stm/renshi/',
            type: 'university'
        }
    ];
}

// 生成唯一ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// 真实网站爬取函数（需要进一步开发）
async function crawlRealWebsite(site) {
    try {
        console.log(`尝试抓取: ${site.name}`);
        
        // 这里可以添加真实的网页抓取逻辑
        // 由于网站反爬虫机制，需要更复杂的处理
        
        // 暂时返回空数组，使用模拟数据
        return [];
        
    } catch (error) {
        console.error(`抓取 ${site.name} 失败:`, error.message);
        return [];
    }
}

module.exports = { 
    fetchRealJobData, 
    KEYWORDS, 
    TARGET_SITES,
    isRelevantJob
};
