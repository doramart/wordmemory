"use strict";

/**
 * 学习进度模型
 * 记录单词的学习状态
 */
module.exports = (app) => {
  const { Schema } = app.mongoose;

  const ProgressSchema = new Schema(
    {
      wordId: {
        type: Schema.Types.ObjectId,
        ref: "Word",
        required: true,
      },
      status: {
        type: String,
        enum: ["learning", "passed", "failed"],
        default: "learning",
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastReviewed: {
        type: Date,
        default: Date.now,
      },
      notes: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
      collection: "progress",
    }
  );

  ProgressSchema.index({ wordId: 1 }, { unique: true });

  return app.mongoose.model("Progress", ProgressSchema);
};
