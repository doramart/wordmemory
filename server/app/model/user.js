"use strict";

/**
 * 用户模型 - PWA 全栈脚手架
 * 精简版：仅保留基础用户信息和认证相关字段
 */
module.exports = (app) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema(
    {
      // 邮箱 - 唯一标识
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "请输入有效的邮箱地址",
        ],
      },
      // 昵称
      nickname: {
        type: String,
        default: function () {
          return this.email ? this.email.split("@")[0] : "用户";
        },
        trim: true,
        maxlength: 50,
      },
      // 头像URL
      avatar: {
        type: String,
        default: "",
      },
      // 用户状态
      status: {
        type: String,
        enum: ["active", "inactive", "banned"],
        default: "active",
      },
      // 最后登录时间
      lastLoginAt: {
        type: Date,
        default: null,
      },
      // 登录次数
      loginCount: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
      collection: "users",
    }
  );

  // 索引
  UserSchema.index({ email: 1 }, { unique: true });
  UserSchema.index({ createdAt: -1 });

  // 实例方法：更新登录信息
  UserSchema.methods.updateLoginInfo = function () {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    return this.save();
  };

  // 静态方法：根据邮箱查找或创建用户
  UserSchema.statics.findOrCreate = async function (
    email,
    additionalData = {}
  ) {
    let user = await this.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new this({
        email: email.toLowerCase(),
        ...additionalData,
      });
      await user.save();
    }

    return user;
  };

  // 转换为 JSON 时的字段过滤
  UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    return {
      _id: obj._id,
      email: obj.email,
      nickname: obj.nickname,
      avatar: obj.avatar,
      status: obj.status,
      lastLoginAt: obj.lastLoginAt,
      loginCount: obj.loginCount,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  };

  return mongoose.model("User", UserSchema);
};
