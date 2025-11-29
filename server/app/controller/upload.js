"use strict";

const Controller = require("egg").Controller;
const path = require("path");
const fs = require("fs");

/**
 * 文件上传控制器
 */
class UploadController extends Controller {
  async uploadImage() {
    const { ctx } = this;
    if (!ctx.service.qiniu.configReady) {
      ctx.helper.fail("七牛云未配置", 500);
      return;
    }

    try {
      const file = (ctx.request.files && ctx.request.files[0]) || null;
      if (!file || !file.filepath) {
        ctx.helper.fail("未找到上传文件", 400);
        return;
      }
      const filename =
        file.filename || path.basename(file.filepath || "upload.jpg");

      const url = await ctx.service.qiniu.uploadFile(
        file.filepath,
        "wordmemory/uploads"
      );

      ctx.helper.success(
        {
          url,
          filename,
        },
        "上传成功"
      );
    } catch (error) {
      ctx.logger.error("上传图片失败:", error);
      ctx.helper.fail(error.message || "上传失败", 500);
    } finally {
      ctx.cleanupRequestFiles();
    }
  }
}

module.exports = UploadController;
