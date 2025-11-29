<template>
  <div class="home-page">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="user-info">
        <van-image
          round
          width="60"
          height="60"
          :src="userStore.userAvatar || defaultAvatar"
          fit="cover"
        />
        <div class="user-detail">
          <h2 class="user-name">{{ userStore.userName || "用户" }}</h2>
          <p class="user-email">{{ userStore.userEmail }}</p>
        </div>
      </div>
      <van-button type="danger" size="small" plain round @click="handleLogout">
        退出登录
      </van-button>
    </div>

    <!-- 欢迎卡片 -->
    <van-cell-group inset class="welcome-card">
      <van-cell center>
        <template #icon>
          <van-icon
            name="smile-o"
            size="48"
            color="#1989fa"
            style="margin-right: 16px"
          />
        </template>
        <template #title>
          <div class="welcome-text">
            <h3>欢迎使用 PWA 全栈脚手架</h3>
            <p>这是一个轻量级的移动端 PWA 应用模板</p>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 功能特性 -->
    <van-cell-group inset title="脚手架特性">
      <van-cell
        v-for="feature in features"
        :key="feature.title"
        :title="feature.title"
        :label="feature.desc"
        :icon="feature.icon"
      />
    </van-cell-group>

    <!-- 技术栈 -->
    <van-cell-group inset title="技术栈">
      <van-cell
        title="前端"
        label="Vue 3 + Vite + Pinia + Vant 4"
        icon="apps-o"
      />
      <van-cell
        title="后端"
        label="Egg.js 3.0 + MongoDB + JWT"
        icon="service-o"
      />
      <van-cell title="部署" label="Docker + Docker Compose" icon="cluster-o" />
    </van-cell-group>

    <!-- 版本信息 -->
    <div class="version-info">
      <p>Version 1.0.0</p>
      <p>PWA Full-Stack Scaffold</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showSuccessToast } from "vant";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

const defaultAvatar = "https://img.yzcdn.cn/vant/cat.jpeg";

const features = ref([
  {
    title: "邮箱验证码登录",
    desc: "安全便捷的无密码登录方式",
    icon: "envelop-o",
  },
  {
    title: "JWT 认证",
    desc: "无状态 Token 认证，支持自动刷新",
    icon: "shield-o",
  },
  {
    title: "PWA 支持",
    desc: "离线缓存、添加到主屏幕",
    icon: "phone-o",
  },
  {
    title: "移动端优先",
    desc: "响应式设计，完美适配移动设备",
    icon: "mobile-o",
  },
  {
    title: "Docker 部署",
    desc: "一键部署，开箱即用",
    icon: "logistics",
  },
]);

async function handleLogout() {
  try {
    await showConfirmDialog({
      title: "确认退出",
      message: "确定要退出登录吗？",
    });

    await userStore.logout();
    showSuccessToast("已退出登录");
    router.push("/login");
  } catch {
    // 用户取消
  }
}
</script>

<style lang="less" scoped>
.home-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-detail {
    .user-name {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .user-email {
      margin: 4px 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}

.welcome-card {
  margin-top: 16px;

  .welcome-text {
    h3 {
      margin: 0;
      font-size: 16px;
      color: #323233;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #969799;
    }
  }
}

.version-info {
  text-align: center;
  padding: 24px 16px;
  color: #969799;
  font-size: 12px;

  p {
    margin: 4px 0;
  }
}
</style>
