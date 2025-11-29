"use strict";

const Service = require("egg").Service;

/**
 * 学习进度服务
 */
class ProgressService extends Service {
  async listAll() {
    return this.ctx.model.Progress.find().populate("wordId");
  }

  async listByStatus(status) {
    return this.ctx.model.Progress.find({ status })
      .populate("wordId")
      .sort({ lastReviewed: -1 });
  }

  async getByWord(wordId) {
    return this.ctx.model.Progress.findOne({ wordId });
  }

  async upsert(wordId, payload) {
    let progress = await this.ctx.model.Progress.findOne({ wordId });
    if (!progress) {
      progress = new this.ctx.model.Progress({ wordId });
    }

    if (payload.status) {
      progress.status = payload.status;
    }
    if (payload.notes !== undefined) {
      progress.notes = payload.notes;
    }
    progress.attempts += 1;
    progress.lastReviewed = Date.now();

    return progress.save();
  }

  async remove(wordId) {
    return this.ctx.model.Progress.findOneAndDelete({ wordId });
  }

  async resetAll() {
    return this.ctx.model.Progress.deleteMany({});
  }
}

module.exports = ProgressService;
