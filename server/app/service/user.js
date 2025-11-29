"use strict";

const Service = require("egg").Service;

/**
 * 用户服务 - PWA 全栈脚手架
 * 提供用户的 CRUD 操作
 */
class UserService extends Service {
  /**
   * 根据邮箱查找或创建用户
   */
  async findOrCreateByEmail(email) {
    const { ctx } = this;
    try {
      return await ctx.model.User.findOrCreate(email.toLowerCase());
    } catch (error) {
      ctx.logger.error("查找或创建用户失败:", error);
      throw new Error("用户操作失败");
    }
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(userId) {
    const { ctx } = this;
    try {
      return await ctx.model.User.findById(userId);
    } catch (error) {
      ctx.logger.error("查找用户失败:", error);
      throw new Error("查找用户失败");
    }
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email) {
    const { ctx } = this;
    try {
      return await ctx.model.User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      ctx.logger.error("查找用户失败:", error);
      throw new Error("查找用户失败");
    }
  }

  /**
   * 更新登录信息
   */
  async updateLoginInfo(userOrId) {
    const { ctx } = this;
    try {
      const user =
        typeof userOrId === "object" && userOrId._id
          ? userOrId
          : await this.findById(userOrId);

      if (!user) throw new Error("用户不存在");

      await user.updateLoginInfo();
      return user;
    } catch (error) {
      ctx.logger.error("更新登录信息失败:", error);
      throw new Error("更新登录信息失败");
    }
  }

  /**
   * 更新用户信息
   */
  async updateById(userId, updateData) {
    const { ctx } = this;
    try {
      const user = await ctx.model.User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      if (!user) throw new Error("用户不存在");
      return user;
    } catch (error) {
      ctx.logger.error("更新用户失败:", error);
      throw new Error("更新用户失败");
    }
  }
}

module.exports = UserService;
