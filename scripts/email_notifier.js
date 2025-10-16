const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // 或 QQ、163等
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // 生成邮件内容
  generateEmailContent(newJobs, totalCount) {
    const date = new Date().toLocaleDateString('zh-CN');
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .job-item { 
            border: 1px solid #ddd; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
            background: #f9f9f9;
          }
          .job-title { 
            color: #2c5aa0; 
            font-size: 18px; 
            margin-bottom: 8px;
          }
          .job-meta { color: #666; font-size: 14px; }
          .badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 3px; 
            color: white; 
            font-size: 12px; 
            margin-right: 5px;
          }
          .badge-gd { background: #28a745; }
          .badge-cy { background: #fd7e14; }
          .badge-hn { background: #e83e8c; }
          .header { 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; 
            padding: 20px; 
            text-align: center;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔬 神经科学招聘日报</h1>
          <p>${date} | 今日发现 ${totalCount} 个新岗位</p>
        </div>
        
        <div class="content">
          <h3>🎯 最新招聘信息</h3>
    `;

    newJobs.forEach(job => {
      const badgeClass = `badge-${job.location === '广东' ? 'gd' : job.location === '川渝' ? 'cy' : 'hn'}`;
      html += `
        <div class="job-item">
          <div class="job-title">${job.position} - ${job.unit}</div>
          <div class="job-meta">
            <span class="badge ${badgeClass}">${job.location}</span>
            📅 ${job.date} | 🔍 ${job.requirements}
          </div>
          <a href="${job.url}" target="_blank">查看详情</a>
        </div>
      `;
    });

    html += `
          <hr>
          <p style="color: #666; font-size: 12px;">
            💡 此邮件由神经科学招聘追踪系统自动发送<br>
            📊 关注领域：超声神经调控、神经电生理、神经调控、脑机接口、神经界面
          </p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  // 发送邮件
  async sendNotification(newJobs) {
    if (newJobs.length === 0) return;

    const emailContent = this.generateEmailContent(newJobs, newJobs.length);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL, // 接收通知的邮箱
      subject: `🧠 神经科学招聘提醒 - ${newJobs.length}个新岗位 (${new Date().toLocaleDateString('zh-CN')})`,
      html: emailContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 邮件通知已发送: ${newJobs.length} 个新岗位`);
    } catch (error) {
      console.error('邮件发送失败:', error);
    }
  }
}

module.exports = EmailNotifier;
