"use strict";

const Service = require("egg").Service;
const axios = require("axios");

/**
 * Doubao / DeepSeek 能力封装
 * 用于图片识别、翻译补全、图片生成
 */
class DoubaoService extends Service {
  get ready() {
    const { doubao } = this.config;
    return Boolean(doubao.apiKey && doubao.apiBase);
  }

  get client() {
    const { doubao } = this.config;
    return axios.create({
      baseURL: doubao.apiBase,
      timeout: doubao.timeout,
      headers: {
        Authorization: `Bearer ${doubao.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * 从图片中提取单词列表
   * @param {Buffer} buffer - 图片二进制
   * @param {string} mimeType - 图片类型
   * @returns {Promise<Array>}
   */
  async extractWordsFromImage(buffer, mimeType) {
    if (!this.ready) {
      throw new Error("Doubao API 未配置");
    }

    const { doubao } = this.config;
    const imageBase64 = buffer.toString("base64");

    const systemPrompt =
      "你是一个负责阅读图片中英文单词清单的助手。任务要求：" +
      "1) 从图片提取所有单词；2) 给出音标；3) 释义必须是中文；4) 例句用简短英文；" +
      '5) 严格返回 JSON 对象 {"words":[{word, phonetic, meaning, example}, ...]}，不要输出其他内容、解释或格式。';

    const userContent = [
      {
        type: "text",
        text:
          '请从这张图片中提取出所有单词，返回 JSON 对象 {"words": [...]}。' +
          "确保 word 字段是英文小写单词，phonetic 保留原始格式，meaning 必须中文，example 给出简短英文句子。",
      },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${imageBase64}` },
      },
    ];

    const resp = await this.client.post("/chat/completions", {
      model: doubao.visionModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 2000,
      stream: false,
    });

    const rawContent = resp.data?.choices?.[0]?.message?.content?.trim() || "";

    // 解析返回
    let parsedWords = [];
    try {
      const parsed = JSON.parse(rawContent);
      parsedWords = Array.isArray(parsed) ? parsed : parsed.words;
      if (!Array.isArray(parsedWords)) {
        throw new Error("Parsed result is not an array");
      }
    } catch (error) {
      const match = rawContent.match(/\[[\s\S]*\]/);
      if (match) {
        parsedWords = JSON.parse(match[0]);
      } else {
        throw new Error(`无法解析 Doubao 结果: ${error.message || "unknown"}`);
      }
    }

    return parsedWords
      .map((item) => ({
        word: item.word?.trim(),
        phonetic: item.phonetic?.trim() || "",
        meaning: item.meaning?.trim() || "",
        example: item.example?.trim() || "",
      }))
      .filter((item) => item.word);
  }

  /**
   * 翻译或补全单词字段
   * @param {Array} payloads - [{ word, phonetic, meaning, example }]
   * @param {string} prompt - 系统提示词
   */
  async translateWordPayloads(payloads, prompt) {
    if (!this.ready) {
      throw new Error("Doubao API 未配置");
    }

    const { doubao } = this.config;

    try {
      const resp = await this.client.post("/chat/completions", {
        model: doubao.visionModel,
        temperature: 0.2,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `原始词条：${JSON.stringify(payloads)}` },
        ],
        max_tokens: 2000,
        stream: false,
      });

      const raw = resp.data?.choices?.[0]?.message?.content?.trim() || "[]";
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed.words;

      if (!Array.isArray(list)) {
        throw new Error("翻译结果格式不正确");
      }

      return list.map((item) => ({
        word: item.word?.trim(),
        phonetic: item.phonetic?.trim() || "",
        meaning: item.meaning?.trim() || "",
        example: item.example?.trim() || "",
      }));
    } catch (error) {
      this.ctx.logger.error(
        "Doubao API Error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * 生成词条详情
   * @param {string} word
   */
  async generateWordDetails(word) {
    const prompt =
      "给定英文单词，补全音标、中文释义（必须中文）、英文例句（简短）。" +
      '保持 word 字段原样，返回 JSON 对象 {"words":[{word, phonetic, meaning, example}]}，不要输出其他内容。';
    const [result] = await this.translateWordPayloads(
      [{ word, phonetic: "", meaning: "", example: "" }],
      prompt
    );
    return result;
  }

  /**
   * 优化用户灵感为专业的图片生成提示词
   * @param {string} word - 单词
   * @param {string} meaning - 释义
   * @param {string} userIdea - 用户灵感描述
   * @returns {Promise<string>} 优化后的提示词
   */
  async optimizeImagePrompt(word, meaning = "", userIdea = "") {
    if (!this.ready) {
      throw new Error("Doubao API 未配置");
    }
    const { doubao } = this.config;
    const systemPrompt = `You are a professional prompt engineer for text-to-image AI models (like DALL-E, Midjourney, Stable Diffusion).

Your task: Transform user's casual creative idea into a detailed, professional image generation prompt for educational vocabulary illustration.

Requirements:
- Focus on concrete visual elements, composition, lighting, color, and style
- Keep the illustration educational, memorable, and appropriate for language learners
- Ensure the word "${word}" is clearly visualized in the scene
- Use clean illustration style with soft lighting and neutral background
- Avoid text, typography, logos, violence, gore, or sensitive content
- Output in English only, 150-300 words
- Format: clear, descriptive phrases separated by commas

Style guidelines:
- Art style: clean vector illustration, flat design, or studio photography
- Composition: square 1:1 canvas, centered subject, middle shot
- Lighting: soft, even lighting with good contrast
- Background: light neutral color, uncluttered
- Detail level: rich but not overwhelming, focus on clarity`;

    const userMessage = `English word: "${word}"
${meaning ? `Meaning: "${meaning}"` : ""}
User's creative idea: "${userIdea}"

Generate an optimized image generation prompt that:
1. Clearly visualizes the word "${word}" and its meaning
2. Incorporates the user's creative scene naturally
3. Follows educational illustration best practices
4. Helps learners memorize the word through visual association
5. Maintains appropriate, safe, and clear imagery

Output only the optimized prompt text, no explanations.`;

    try {
      const resp = await this.client.post("/chat/completions", {
        model: doubao.chatModel,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 500,
        stream: false,
      });

      const optimizedPrompt =
        resp.data?.choices?.[0]?.message?.content?.trim() || "";

      if (!optimizedPrompt) {
        throw new Error("未获取到优化后的提示词");
      }

      this.ctx.logger.info(
        `Prompt optimized for word "${word}": ${optimizedPrompt.substring(
          0,
          100
        )}...`
      );

      return optimizedPrompt;
    } catch (error) {
      this.ctx.logger.error(
        "Prompt optimization failed:",
        error.response?.data || error.message
      );
      throw new Error("提示词优化失败: " + (error.message || "未知错误"));
    }
  }

  /**
   * 生成插画
   * @param {string} prompt
   * @returns {Promise<string>} 图片地址
   */
  async generateImage(prompt) {
    if (!this.ready) {
      throw new Error("Doubao API 未配置");
    }
    const { doubao } = this.config;

    const resp = await this.client.post("/images/generations", {
      model: doubao.imageModel,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const url = resp.data?.data?.[0]?.url;
    if (!url) {
      throw new Error("未获取到图片地址");
    }
    return url;
  }
}

module.exports = DoubaoService;
