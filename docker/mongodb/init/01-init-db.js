// MongoDB 初始化脚本
// 这个脚本会在 MongoDB 容器首次启动时自动执行

// 切换到目标数据库
db = db.getSiblingDB("pwa_scaffold_db");

// 创建应用用户
db.createUser({
  user: "pwa_scaffold_user",
  pwd: "pwa_scaffold_password",
  roles: [
    {
      role: "readWrite",
      db: "pwa_scaffold_db",
    },
  ],
});

// 创建集合和索引
print("开始创建集合和索引...");

// 创建用户集合
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// 如需添加更多集合，在此处添加
// db.createCollection("your_collection");
// db.your_collection.createIndex({ field: 1 });

// 插入默认数据
print("插入默认数据...");

// 插入默认用户
db.users.insertOne({
  _id: ObjectId("6507f1f77778b7a6bb6e1234"),
  email: "demo@pwa-scaffold.com",
  nickname: "演示用户",
  avatar: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

print("数据库初始化完成！");
print("默认用户: demo@pwa-scaffold.com");
