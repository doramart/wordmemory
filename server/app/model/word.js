"use strict";

/**
 * 单词模型
 * 对应 wordmemory 项目中的 Word 定义
 */
module.exports = (app) => {
  const { Schema } = app.mongoose;

  const WordSchema = new Schema(
    {
      word: {
        type: String,
        required: true,
        trim: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      phonetic: {
        type: String,
        default: "",
      },
      pronunciation: {
        type: String,
        default: "",
      },
      imageUrl: {
        type: String,
        default: "",
      },
      meaning: {
        type: String,
        default: "",
      },
      example: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
      collection: "words",
    }
  );

  WordSchema.index({ userId: 1, word: 1 }, { unique: true });
  WordSchema.index({ userId: 1, createdAt: -1 });

  return app.mongoose.model("Word", WordSchema);
};
