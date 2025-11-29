"use strict";

const Service = require("egg").Service;
const axios = require("axios");
const fs = require("fs");

/**
 * 单词业务逻辑
 */
class WordService extends Service {
  /**
   * 获取当前用户的所有单词，按创建时间倒序
   */
  async listAll(userId) {
    return this.ctx.model.Word.find({ userId }).sort({ createdAt: -1 });
  }

  async findById(id, userId) {
    return this.ctx.model.Word.findOne({ _id: id, userId });
  }

  async create(payload, userId) {
    const word = new this.ctx.model.Word({ ...payload, userId });
    return word.save();
  }

  async update(id, payload, userId) {
    return this.ctx.model.Word.findOneAndUpdate({ _id: id, userId }, payload, {
      new: true,
      runValidators: true,
    });
  }

  async remove(id, userId) {
    return this.ctx.model.Word.findOneAndDelete({ _id: id, userId });
  }

  /**
   * 从图片导入单词列表
   * @param {Object} file - egg file stream info
   */
  async importFromImage(file) {
    const { ctx } = this;
    if (!file || !file.filepath) {
      throw new Error("未找到上传的图片");
    }

    const buffer = fs.readFileSync(file.filepath);
    const mimeType =
      file.mime || file.mimeType || file.mimetype || "image/jpeg";
    const doubaoPayloads = await ctx.service.doubao.extractWordsFromImage(
      buffer,
      mimeType
    );

    // 判断是否需要翻译
    const needTranslate = doubaoPayloads.some(
      (item) => !/[\u4e00-\u9fa5]/.test(item.meaning || "")
    );

    let translatedPayloads = doubaoPayloads;
    if (needTranslate) {
      try {
        const prompt =
          '将以下词条的释义翻译成中文（如果已是中文保持不变），补齐缺失的字段。字段：word, phonetic, meaning, example。返回 JSON 对象 {"words":[...] }，不要输出多余文本。';
        translatedPayloads = await ctx.service.doubao.translateWordPayloads(
          doubaoPayloads,
          prompt
        );
      } catch (error) {
        ctx.logger.warn("翻译失败，使用原始结果:", error);
      }
    }

    if (!translatedPayloads.length) {
      throw new Error("未能从图片中识别到单词");
    }

    // 获取当前用户ID
    const userId = ctx.state.user._id;

    // Upsert
    const bulkOps = translatedPayloads.map((item) => ({
      updateOne: {
        filter: { word: item.word, userId },
        update: {
          $setOnInsert: { createdAt: new Date(), userId },
          $set: {
            phonetic: item.phonetic,
            meaning: item.meaning,
            example: item.example,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await ctx.model.Word.bulkWrite(bulkOps, { ordered: false });
    const inserted = (result.upsertedCount || 0) + (result.insertedCount || 0);
    const modified = result.modifiedCount || 0;

    return {
      success: true,
      total: translatedPayloads.length,
      inserted,
      updated: modified,
      words: translatedPayloads,
    };
  }

  /**
   * 生成词条详情
   */
  async generateDetails(word) {
    return this.ctx.service.doubao.generateWordDetails(word);
  }

  /**
   * 根据远程图片地址下载到本地临时文件
   */
  async downloadImage(url, targetPath) {
    const resp = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    fs.writeFileSync(targetPath, resp.data);
  }
}

module.exports = WordService;
