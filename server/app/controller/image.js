"use strict";

const Controller = require("egg").Controller;

/**
 * 图片生成控制器
 */
class ImageController extends Controller {
  async generate() {
    const { ctx } = this;
    try {
      const userId = ctx.state.user?._id;
      const word = await ctx.service.word.findById(ctx.params.wordId, userId);
      if (!word) {
        ctx.helper.fail("单词不存在", 404);
        return;
      }
      if (!ctx.service.doubao.ready) {
        ctx.helper.fail("Doubao API 未配置", 500);
        return;
      }
      const result = await ctx.service.image.generateForWord(word);
      ctx.helper.success(result, "生成成功");
    } catch (error) {
      ctx.logger.error("生成单词图片失败:", error);
      ctx.helper.fail(
        error.response?.data?.error || error.message || "生成失败",
        500
      );
    }
  }

  async generateByText() {
    const { ctx } = this;
    try {
      const { word, meaning = "" } = ctx.request.body || {};
      if (!word || !word.trim()) {
        ctx.helper.fail("word 字段不能为空", 400);
        return;
      }
      if (!ctx.service.doubao.ready) {
        ctx.helper.fail("Doubao API 未配置", 500);
        return;
      }
      const result = await ctx.service.image.generateByPrompt({
        word,
        meaning,
        mode: "auto",
      });
      ctx.helper.success(result, "生成成功");
    } catch (error) {
      ctx.logger.error("自动生图失败:", error);
      ctx.helper.fail(
        error.response?.data?.error || error.message || "生成失败",
        500
      );
    }
  }

  async generateByCustomPrompt() {
    const { ctx } = this;
    try {
      const { word, meaning = "", prompt = "" } = ctx.request.body || {};
      if (!word || !word.trim()) {
        ctx.helper.fail("word 字段不能为空", 400);
        return;
      }
      if (!prompt || !prompt.trim()) {
        ctx.helper.fail("prompt 字段不能为空", 400);
        return;
      }
      if (prompt.length > 400) {
        ctx.helper.fail("提示词过长，请控制在 400 字内", 400);
        return;
      }
      if (!ctx.service.doubao.ready) {
        ctx.helper.fail("Doubao API 未配置", 500);
        return;
      }

      ctx.logger.info(
        `Custom image generation started for word "${word}" with user prompt: ${prompt.substring(
          0,
          50
        )}...`
      );

      const result = await ctx.service.image.generateByPrompt({
        word,
        meaning,
        userPrompt: prompt,
        mode: "custom",
      });

      ctx.logger.info(`Custom image generated successfully for word "${word}"`);
      ctx.helper.success(result, "生成成功");
    } catch (error) {
      ctx.logger.error("自定义生图失败:", error);
      const errorMsg = error.message?.includes("提示词优化失败")
        ? "AI 提示词优化失败，请稍后重试"
        : error.response?.data?.error || error.message || "生成失败";
      ctx.helper.fail(errorMsg, 500);
    }
  }
}

module.exports = ImageController;
