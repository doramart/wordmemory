"use strict";

const Service = require("egg").Service;
const nodemailer = require("nodemailer");

/**
 * 邮件服务 - PWA 全栈脚手架
 * 提供验证码邮件发送功能
 */
class MailService extends Service {
  constructor(ctx) {
    super(ctx);
    this.transporter = null;
  }

  /**
   * 初始化邮件传输器
   */
  async initTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.mail.service,
        port: this.config.mail.port,
        auth: this.config.mail.auth,
      });
    }
    return this.transporter;
  }

  /**
   * 发送验证码邮件
   */
  async sendVerifyCode(email, code) {
    try {
      const transporter = await this.initTransporter();

      const mailOptions = {
        from: this.config.mail.from,
        to: email,
        subject: "登录验证码",
        html: this.getVerifyCodeTemplate(code),
      };

      const result = await transporter.sendMail(mailOptions);
      this.logger.info(`验证码邮件发送成功: ${email}`);

      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error(`验证码邮件发送失败: ${email}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 验证码邮件模板
   */
  getVerifyCodeTemplate(code) {
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">登录验证码</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 16px; color: #666;">您的验证码是：</p>
          <p style="font-size: 32px; font-weight: bold; color: #1890ff; letter-spacing: 8px;">${code}</p>
          <p style="font-size: 14px; color: #999;">验证码 5 分钟内有效，请勿泄露给他人</p>
        </div>
      </div>
    `;
  }

  /**
   * 验证邮件服务连接
   */
  async verifyConnection() {
    try {
      const transporter = await this.initTransporter();
      await transporter.verify();
      return { success: true };
    } catch (error) {
      this.logger.error("邮件服务连接失败:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MailService;
