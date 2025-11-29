"use strict";

const Controller = require("egg").Controller;

/**
 * 单词控制器
 * 覆盖 wordmemory backend 里的业务
 */
class WordController extends Controller {
  async index() {
    const { ctx } = this;
    try {
      const userId = ctx.state.user._id;
      const words = await ctx.service.word.listAll(userId);
      ctx.helper.success(words);
    } catch (error) {
      ctx.logger.error("获取单词列表失败:", error);
      ctx.helper.fail("获取单词列表失败", 500);
    }
  }

  async show() {
    const { ctx } = this;
    try {
      const userId = ctx.state.user._id;
      const word = await ctx.service.word.findById(ctx.params.id, userId);
      if (!word) {
        ctx.helper.fail("单词不存在", 404);
        return;
      }
      ctx.helper.success(word);
    } catch (error) {
      ctx.logger.error("获取单词失败:", error);
      ctx.helper.fail("获取单词失败", 500);
    }
  }

  async create() {
    const { ctx } = this;
    const rule = {
      word: { type: "string", required: true, max: 100, trim: true },
      phonetic: { type: "string", required: false, max: 200, trim: true },
      pronunciation: { type: "string", required: false, max: 500, trim: true },
      imageUrl: { type: "string", required: false, max: 1000, trim: true },
      meaning: { type: "string", required: false, max: 1000, trim: true },
      example: { type: "string", required: false, max: 1000, trim: true },
    };

    try {
      ctx.validate(rule);
      const userId = ctx.state.user._id;
      ctx.logger.info(`用户 ${userId} 尝试创建单词: ${ctx.request.body.word}`);
      const word = await ctx.service.word.create(ctx.request.body, userId);
      ctx.helper.success(word, "创建成功", 200);
    } catch (error) {
      if (error.code === 11000) {
        ctx.logger.warn(
          `单词重复 - 用户: ${ctx.state.user._id}, 单词: ${ctx.request.body.word}`
        );
        ctx.helper.fail("您已添加过这个单词", 400);
        return;
      }
      ctx.logger.error("创建单词失败:", error);
      ctx.helper.fail(error.errors?.[0]?.message || "创建单词失败", 500);
    }
  }

  async update() {
    const { ctx } = this;
    try {
      const userId = ctx.state.user._id;
      const word = await ctx.service.word.update(
        ctx.params.id,
        ctx.request.body,
        userId
      );
      if (!word) {
        ctx.helper.fail("单词不存在", 404);
        return;
      }
      ctx.helper.success(word, "更新成功");
    } catch (error) {
      ctx.logger.error("更新单词失败:", error);
      ctx.helper.fail("更新单词失败", 500);
    }
  }

  async destroy() {
    const { ctx } = this;
    try {
      const userId = ctx.state.user._id;
      const word = await ctx.service.word.remove(ctx.params.id, userId);
      if (!word) {
        ctx.helper.fail("单词不存在", 404);
        return;
      }
      ctx.helper.success(null, "删除成功");
    } catch (error) {
      ctx.logger.error("删除单词失败:", error);
      ctx.helper.fail("删除单词失败", 500);
    }
  }

  async importFromImage() {
    const { ctx } = this;
    try {
      const file = (ctx.request.files && ctx.request.files[0]) || null;
      if (!file || !file.filepath) {
        ctx.helper.fail("未找到上传的图片", 400);
        return;
      }
      const result = await ctx.service.word.importFromImage(file);
      ctx.helper.success(result, "批量导入成功");
    } catch (error) {
      ctx.logger.error("图片导入单词失败:", error);
      ctx.helper.fail(
        error.message || "图片导入失败",
        error.status || 500,
        error.response?.data
      );
    } finally {
      ctx.cleanupRequestFiles();
    }
  }

  async generateDetails() {
    const { ctx } = this;
    try {
      const { word } = ctx.request.body || {};
      if (!word || !word.trim()) {
        ctx.helper.fail("word 字段不能为空", 400);
        return;
      }
      if (!ctx.service.doubao.ready) {
        ctx.helper.fail("Doubao API 未配置", 500);
        return;
      }
      const details = await ctx.service.word.generateDetails(word.trim());
      ctx.helper.success(details, "生成成功");
    } catch (error) {
      ctx.logger.error("生成单词详情失败:", error);
      ctx.helper.fail(
        error.response?.data?.error?.message || error.message || "生成失败",
        500
      );
    }
  }
}

module.exports = WordController;
