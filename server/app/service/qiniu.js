"use strict";

const Service = require("egg").Service;
const qiniu = require("qiniu");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * 七牛云上传封装
 */
class QiniuService extends Service {
  get configReady() {
    const { qiniu: cfg } = this.config;
    return (
      cfg.bucket && cfg.accessKey && cfg.secretKey && cfg.domain
    );
  }

  get uploader() {
    const { qiniu: cfg } = this.config;
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone[cfg.zone || "Zone_z2"];
    config.useHttpsDomain = true;
    config.useCdnDomain = true;
    const mac = new qiniu.auth.digest.Mac(
      cfg.accessKey,
      cfg.secretKey
    );
    return { config, mac };
  }

  /**
   * 上传本地文件
   * @param {string} filePath
   * @param {string} keyPrefix
   */
  async uploadFile(filePath, keyPrefix = "wordmemory") {
    if (!this.configReady) {
      throw new Error("七牛云配置不完整");
    }
    const { qiniu: cfg } = this.config;
    const { config, mac } = this.uploader;
    const key = `${keyPrefix}/${uuidv4()}${path.extname(filePath) || ""}`;

    const putPolicy = new qiniu.rs.PutPolicy({
      scope: cfg.bucket,
      returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize)}',
    });
    const uploadToken = putPolicy.uploadToken(mac);
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    const result = await new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        filePath,
        putExtra,
        (err, body, info) => {
          if (err) {
            reject(err);
          } else if (info.statusCode === 200) {
            resolve(body);
          } else {
            reject(new Error(`Qiniu upload failed: ${info.statusCode}`));
          }
        }
      );
    });

    return `${cfg.domain}/${result.key}`;
  }

  /**
   * 上传 Buffer
   * @param {Buffer} buffer
   * @param {string} filename
   * @param {string} keyPrefix
   */
  async uploadBuffer(buffer, filename, keyPrefix = "wordmemory") {
    const tmpPath = path.join(
      this.app.baseDir,
      "run",
      `${uuidv4()}-${filename || "file"}`
    );
    fs.writeFileSync(tmpPath, buffer);
    try {
      return await this.uploadFile(tmpPath, keyPrefix);
    } finally {
      fs.existsSync(tmpPath) && fs.unlinkSync(tmpPath);
    }
  }
}

module.exports = QiniuService;
