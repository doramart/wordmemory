"use strict";

const Cache = require("js-cache");

module.exports = (app) => {
  // 应用启动完成
  app.beforeStart(async () => {
    console.log("🚀 Application is starting...");

    // 修复单词索引（确保复合唯一索引正确）
    try {
      const Word = app.mongoose.model("Word");
      const collection = Word.collection;

      // 获取所有索引
      const indexes = await collection.indexes();
      console.log("📋 检查 words 集合索引...");

      // 检查是否存在错误的单独 word 唯一索引
      const wrongIndex = indexes.find(
        (index) =>
          index.name !== "_id_" &&
          index.key.word === 1 &&
          !index.key.userId &&
          index.unique === true
      );

      if (wrongIndex) {
        console.log(`🗑️  发现错误索引 ${wrongIndex.name}，正在删除...`);
        await collection.dropIndex(wrongIndex.name);
        console.log(`✅ 已删除错误索引: ${wrongIndex.name}`);
      }

      // 确保正确的复合唯一索引存在
      const hasCorrectIndex = indexes.some(
        (index) =>
          index.key.userId === 1 &&
          index.key.word === 1 &&
          index.unique === true
      );

      if (!hasCorrectIndex) {
        console.log("📝 创建正确的复合唯一索引...");
        await collection.createIndex({ userId: 1, word: 1 }, { unique: true });
        console.log("✅ 已创建索引: userId_1_word_1");
      } else {
        console.log("✅ 单词索引检查通过");
      }
    } catch (error) {
      console.error("⚠️  索引检查失败:", error.message);
    }
  });

  // 应用启动成功
  app.ready(() => {
    console.log("✅ Application started successfully");

    // 初始化全局缓存实例，挂载到app对象上
    app.cache = new Cache();
    console.log("🔄 初始化全局缓存实例 (app.cache)");

    // 缓存设置 - 监听refreshCache事件
    app.messenger.on("refreshCache", (by) => {
      console.log("🔄 收到refreshCache事件:", by);
      const ctx = app.createAnonymousContext();
      ctx.runInBackground(async () => {
        const { key, value, time } = by;
        app.cache.set(key, value, time);
        console.log(`✅ 缓存设置成功: ${key}, 过期时间: ${time}ms`);
      });
    });

    // 缓存清除 - 监听clearCache事件
    app.messenger.on("clearCache", (by) => {
      console.log("🗑️ 收到clearCache事件:", by);
      const ctx = app.createAnonymousContext();
      ctx.runInBackground(async () => {
        const { key } = by;
        key && app.cache.del(key);
        console.log(`✅ 缓存清除成功: ${key}`);
      });
    });
  });

  // 应用即将关闭
  app.beforeClose(async () => {
    console.log("🛑 Application is shutting down...");

    // 清理缓存
    if (app.cache) {
      console.log("🔄 清理缓存实例");
      app.cache = null;
    }
  });
};
