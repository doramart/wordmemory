"use strict";

const Controller = require("egg").Controller;

/**
 * 认证控制器 - PWA 全栈脚手架
 * 提供邮箱验证码登录、Token 刷新、用户信息获取等功能
 */
class AuthController extends Controller {
  /**
   * 发送验证码
   * POST /api/auth/send-code
   */
  async sendCode() {
    const { ctx } = this;

    const rule = {
      email: { type: "email", required: true },
    };

    try {
      ctx.validate(rule);
    } catch (error) {
      ctx.helper.fail(`参数验证失败: ${error.message}`, 400);
      return;
    }

    const { email } = ctx.request.body;

    try {
      // 检查发送频率限制
      const intervalCheck = await ctx.service.cache.checkSendInterval(email);
      if (!intervalCheck.canSend) {
        ctx.helper.fail(intervalCheck.message, 429);
        return;
      }

      // 生成验证码
      const code = ctx.service.cache.generateVerifyCode();

      // 发送邮件
      const mailResult = await ctx.service.mail.sendVerifyCode(email, code);
      if (!mailResult.success) {
        ctx.helper.fail("邮件发送失败，请稍后重试", 500);
        return;
      }

      // 缓存验证码
      await ctx.service.cache.setVerifyCode(email, code);
      await ctx.service.cache.setSendTime(email);

      ctx.helper.success(
        {
          email,
          expiresIn: Math.floor(this.config.verifyCode.expireTime / 1000),
        },
        "验证码发送成功"
      );
    } catch (error) {
      ctx.logger.error("发送验证码失败:", error);
      ctx.helper.fail("系统错误，请稍后重试", 500);
    }
  }

  /**
   * 邮箱验证码登录
   * POST /api/auth/login
   */
  async login() {
    const { ctx } = this;

    const rule = {
      email: { type: "email", required: true },
      code: { type: "string", required: true, min: 6, max: 6 },
    };

    try {
      ctx.validate(rule);
    } catch (error) {
      ctx.helper.fail(`参数验证失败: ${error.message}`, 400);
      return;
    }

    const { email, code } = ctx.request.body;

    try {
      // 验证验证码
      const verifyResult = await ctx.service.cache.verifyCode(email, code);
      if (!verifyResult.success) {
        ctx.helper.fail(verifyResult.message, 400);
        return;
      }

      // 查找或创建用户
      const user = await ctx.service.user.findOrCreateByEmail(email);

      // 更新登录信息
      await ctx.service.user.updateLoginInfo(user);

      // 生成 JWT Token
      const token = await ctx.service.jwt.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      // 设置 Session
      ctx.session.userId = user._id.toString();
      ctx.session.user = user.toJSON();

      // 设置 Cookie
      ctx.cookies.set("user_id", user._id.toString(), {
        httpOnly: false,
        secure: ctx.app.config.env === "production",
        maxAge: 7 * 24 * 3600 * 1000,
      });

      ctx.helper.success(
        {
          token,
          user: user.toJSON(),
        },
        "登录成功"
      );
    } catch (error) {
      ctx.logger.error("登录失败:", error);
      ctx.helper.fail("登录失败，请稍后重试", 500);
    }
  }

  /**
   * 获取用户信息
   * GET /api/auth/profile
   */
  async profile() {
    const { ctx } = this;

    try {
      let user = null;

      // 优先从 Session 获取
      if (ctx.session.userId) {
        user = await ctx.service.user.findById(ctx.session.userId);
      }

      // 从 JWT 中间件获取
      if (!user && ctx.state.user) {
        user = ctx.state.user;
      }

      if (!user) {
        ctx.helper.fail("用户未登录", 401);
        return;
      }

      ctx.helper.success(
        user.toJSON ? user.toJSON() : user,
        "获取用户信息成功"
      );
    } catch (error) {
      ctx.logger.error("获取用户信息失败:", error);
      ctx.helper.fail("获取用户信息失败", 500);
    }
  }

  /**
   * 刷新 Token
   * POST /api/auth/refresh-token
   */
  async refreshToken() {
    const { ctx } = this;

    try {
      const oldToken = ctx.service.jwt.extractTokenFromHeader(ctx);

      if (!oldToken) {
        ctx.helper.fail("缺少 Token", 400);
        return;
      }

      const newToken = await ctx.service.jwt.refreshToken(oldToken);

      if (!newToken) {
        ctx.helper.fail("Token 刷新失败，请重新登录", 401);
        return;
      }

      ctx.helper.success({ token: newToken }, "Token 刷新成功");
    } catch (error) {
      ctx.logger.error("刷新 Token 失败:", error);
      ctx.helper.fail("刷新 Token 失败", 500);
    }
  }

  /**
   * 退出登录
   * POST /api/auth/logout
   */
  async logout() {
    const { ctx } = this;

    try {
      ctx.session = null;
      ctx.cookies.set("user_id", null, { maxAge: 0 });
      ctx.state.user = null;
      ctx.state.token = null;

      ctx.helper.success(null, "退出登录成功");
    } catch (error) {
      ctx.logger.error("退出登录失败:", error);
      ctx.helper.fail("退出登录失败", 500);
    }
  }
}

module.exports = AuthController;
