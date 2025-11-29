"use strict";

const Controller = require("egg").Controller;

/**
 * 学习进度控制器
 */
class ProgressController extends Controller {
  async index() {
    const { ctx } = this;
    try {
      const data = await ctx.service.progress.listAll();
      ctx.helper.success(data);
    } catch (error) {
      ctx.logger.error("获取进度失败:", error);
      ctx.helper.fail("获取进度失败", 500);
    }
  }

  async byStatus() {
    const { ctx } = this;
    try {
      const data = await ctx.service.progress.listByStatus(
        ctx.params.status
      );
      ctx.helper.success(data);
    } catch (error) {
      ctx.logger.error("按状态获取进度失败:", error);
      ctx.helper.fail("获取进度失败", 500);
    }
  }

  async byWord() {
    const { ctx } = this;
    try {
      let progress = await ctx.service.progress.getByWord(
        ctx.params.wordId
      );
      if (!progress) {
        progress = await ctx.model.Progress.create({
          wordId: ctx.params.wordId,
        });
      }
      ctx.helper.success(progress);
    } catch (error) {
      ctx.logger.error("获取单词进度失败:", error);
      ctx.helper.fail("获取进度失败", 500);
    }
  }

  async updateByWord() {
    const { ctx } = this;
    try {
      const { status, notes } = ctx.request.body || {};
      const progress = await ctx.service.progress.upsert(
        ctx.params.wordId,
        { status, notes }
      );
      ctx.helper.success(progress, "更新成功");
    } catch (error) {
      ctx.logger.error("更新进度失败:", error);
      ctx.helper.fail("更新进度失败", 500);
    }
  }

  async resetByWord() {
    const { ctx } = this;
    try {
      await ctx.service.progress.remove(ctx.params.wordId);
      ctx.helper.success(null, "重置成功");
    } catch (error) {
      ctx.logger.error("重置进度失败:", error);
      ctx.helper.fail("重置进度失败", 500);
    }
  }

  async resetAll() {
    const { ctx } = this;
    try {
      await ctx.service.progress.resetAll();
      ctx.helper.success(null, "全部进度已重置");
    } catch (error) {
      ctx.logger.error("重置全部进度失败:", error);
      ctx.helper.fail("重置进度失败", 500);
    }
  }
}

module.exports = ProgressController;
