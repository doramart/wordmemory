"use strict";

/**
 * 路由配置 - PWA 全栈脚手架
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;

  // ==================== 公开接口 ====================

  // 健康检查
  router.get("/api/health", controller.health.index);

  // ==================== 认证接口 ====================

  router.post("/api/auth/send-code", controller.auth.sendCode); // 发送验证码
  router.post("/api/auth/login", controller.auth.login); // 登录
  router.post("/api/auth/refresh-token", controller.auth.refreshToken); // 刷新 Token
  router.post("/api/auth/logout", controller.auth.logout); // 退出登录
  router.get("/api/auth/profile", controller.auth.profile); // 获取用户信息

  // ==================== 单词与学习 ====================
  router.get("/api/words", controller.word.index);
  router.get("/api/words/:id", controller.word.show);
  router.post("/api/words", controller.word.create);
  router.put("/api/words/:id", controller.word.update);
  router.delete("/api/words/:id", controller.word.destroy);
  router.post("/api/words/import-from-image", controller.word.importFromImage);
  router.post("/api/words/generate-details", controller.word.generateDetails);

  router.get("/api/progress", controller.progress.index);
  router.get("/api/progress/status/:status", controller.progress.byStatus);
  router.get("/api/progress/word/:wordId", controller.progress.byWord);
  router.put("/api/progress/word/:wordId", controller.progress.updateByWord);
  router.delete("/api/progress/word/:wordId", controller.progress.resetByWord);
  router.delete("/api/progress", controller.progress.resetAll);

  router.post("/api/images/generate/text", controller.image.generateByText);
  router.post("/api/images/generate/custom", controller.image.generateByCustomPrompt);
  router.post("/api/images/generate/:wordId", controller.image.generate);
  router.post("/api/upload/image", controller.upload.uploadImage);

  // ==================== SPA 路由处理 ====================

  router.get("/*", async (ctx) => {
    if (ctx.path.startsWith("/api/")) {
      return;
    }

    ctx.type = "html";

    try {
      const fs = require("fs");
      const path = require("path");
      const indexPath = path.join(ctx.app.baseDir, "app/public/index.html");

      if (fs.existsSync(indexPath)) {
        ctx.body = fs.readFileSync(indexPath, "utf8");
      } else {
        ctx.status = 404;
        ctx.body = "index.html not found";
      }
    } catch (error) {
      ctx.logger.error("读取 index.html 失败:", error);
      ctx.status = 500;
      ctx.body = "Internal Server Error";
    }
  });
};
