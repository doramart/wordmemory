"use strict";

const Service = require("egg").Service;
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

/**
 * 图片生成与上传
 */
class ImageService extends Service {
  /**
   * 生成并上传图片（带七牛托管）
   * @param {string} prompt - 最终提示词
   * @returns {Promise<{ imageUrl: string, originalUrl: string, prompt: string }>}
   */
  async generateAndUpload(prompt) {
    const { ctx } = this;
    const doubaoImageUrl = await ctx.service.doubao.generateImage(prompt);

    let finalUrl = doubaoImageUrl;
    if (ctx.service.qiniu.configReady) {
      const tempPath = path.join(
        ctx.app.baseDir,
        "run",
        `word_${uuidv4()}.jpg`
      );
      try {
        await ctx.service.word.downloadImage(doubaoImageUrl, tempPath);
        finalUrl = await ctx.service.qiniu.uploadFile(tempPath, "wordmemory");
      } catch (error) {
        ctx.logger.warn("上传到七牛失败，使用原始地址", error.message || error);
        finalUrl = doubaoImageUrl;
      } finally {
        fs.existsSync(tempPath) && fs.unlinkSync(tempPath);
      }
    }

    return {
      imageUrl: finalUrl,
      originalUrl: doubaoImageUrl,
      prompt,
    };
  }

  buildAutoPrompt(word, meaning = "") {
    const safeMeaning = meaning?.trim()
      ? ` Meaning: ${meaning.trim()}.`
      : " Provide a literal depiction of the word meaning.";
    return [
      `Create a studio-quality educational illustration for the English vocabulary word "${word}".`,
      safeMeaning,
      "Style: clean vector or flat illustration, soft lighting, rich detail but uncluttered, clear subject, no text or typography.",
      "Composition: square 1:1 canvas, centered subject, light neutral background, high contrast, camera middle shot.",
      "Purpose: help language learners quickly memorize the word with an easy-to-recognize, friendly visual. Avoid gore, violence, or brand logos.",
    ].join(" ");
  }

  /**
   * 为单词生成图片并回写 imageUrl
   * @param {Object} wordDoc - Word 文档
   */
  async generateForWord(wordDoc) {
    const prompt = this.buildAutoPrompt(wordDoc.word, wordDoc.meaning);
    const result = await this.generateAndUpload(prompt);
    wordDoc.imageUrl = result.imageUrl;
    await wordDoc.save();

    return { ...result, word: wordDoc };
  }

  /**
   * 根据单词与用户提示生成插画（不落库）
   * @param {Object} payload
   * @param {string} payload.word
   * @param {string} [payload.meaning]
   * @param {string} [payload.userPrompt]
   * @param {"auto"|"custom"} [payload.mode]
   */
  async generateByPrompt({
    word,
    meaning = "",
    userPrompt = "",
    mode = "auto",
  }) {
    const { ctx } = this;
    const cleanWord = word.trim();

    let finalPrompt;

    if (mode === "custom" && userPrompt.trim()) {
      // 自定义模式：使用 LLM 优化用户灵感为专业提示词
      ctx.logger.info(
        `Optimizing custom prompt for word "${cleanWord}" with user idea: ${userPrompt.substring(
          0,
          100
        )}...`
      );

      try {
        finalPrompt = await ctx.service.doubao.optimizeImagePrompt(
          cleanWord,
          meaning,
          userPrompt.trim()
        );
        ctx.logger.info(
          `Optimized prompt: ${finalPrompt.substring(0, 100)}...`
        );
      } catch (error) {
        ctx.logger.error(
          "Prompt optimization failed, falling back to basic prompt:",
          error
        );
        // 优化失败时降级为基础拼接
        const basePrompt = this.buildAutoPrompt(cleanWord, meaning);
        finalPrompt = [
          basePrompt,
          `Incorporate the user's creative scene: ${userPrompt.trim()}.`,
          "Keep the scene clear, memorable, and appropriate for learners; avoid clutter, text, and unsafe content.",
        ].join(" ");
      }
    } else {
      // 自动模式：使用预设提示词模板
      finalPrompt = this.buildAutoPrompt(cleanWord, meaning);
    }

    return this.generateAndUpload(finalPrompt);
  }
}

module.exports = ImageService;
