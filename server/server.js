// server.js
const egg = require("egg");

const workers = Number(
  process.env.WORKERS || process.argv[2] || require("os").cpus().length
);
egg.startCluster({
  workers,
  baseDir: __dirname,
});
