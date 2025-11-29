import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";
import { VitePWA } from "vite-plugin-pwa";
import postcsspxtorem from "postcss-pxtorem";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    // Vant 组件自动导入
    Components({
      resolvers: [VantResolver()],
    }),
    // PWA 配置
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/**/*.png"],
      manifest: {
        name: "PWA Full-Stack Scaffold",
        short_name: "单词速记",
        description: "轻量级 PWA 全栈脚手架",
        theme_color: "#1989fa",
        background_color: "#f7f8fa",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "zh-CN",
        icons: [
          { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // 开发环境也启用 PWA，方便测试
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  css: {
    postcss: {
      plugins: [
        postcsspxtorem({
          rootValue: 37.5,
          propList: ["*"],
          selectorBlackList: [".no-rem"],
          minPixelValue: 2,
        }),
      ],
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:39010",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "../server/app/public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("pinia")) {
              return "vue";
            }
            if (id.includes("vant")) {
              return "vant";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
