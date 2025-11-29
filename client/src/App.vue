<template>
  <router-view />

  <!-- 全局 Loading -->
  <van-overlay :show="userStore.loading" class="global-loading">
    <div class="loading-wrapper">
      <van-loading color="#1989fa" size="40" vertical>加载中...</van-loading>
    </div>
  </van-overlay>

  <!-- PWA 安装提示 -->
  <PWAInstallPrompt />
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import PWAInstallPrompt from "@/components/PWAInstallPrompt.vue";

const userStore = useUserStore();
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: "Varela Round", "Nunito", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-main);
  background: var(--background-gradient);
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}

.global-loading {
  .loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>
