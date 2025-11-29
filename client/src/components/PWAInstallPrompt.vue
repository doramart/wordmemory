<template>
  <van-popup v-model:show="showPrompt" position="bottom" round>
    <div class="pwa-install-prompt">
      <div class="prompt-header">
        <div class="prompt-icon">
          <van-icon name="apps-o" size="32" color="#1989fa" />
        </div>
        <div class="prompt-info">
          <h3>添加到主屏幕</h3>
          <p>获得更快的访问和更好的体验</p>
        </div>
        <van-icon name="cross" class="close-btn" @click="dismiss" />
      </div>

      <div class="prompt-features">
        <div class="feature-item">
          <van-icon name="fire-o" color="#07c160" />
          <span>快速启动</span>
        </div>
        <div class="feature-item">
          <van-icon name="phone-o" color="#1989fa" />
          <span>全屏体验</span>
        </div>
        <div class="feature-item">
          <van-icon name="shield-o" color="#ff976a" />
          <span>离线可用</span>
        </div>
      </div>

      <div class="prompt-actions">
        <van-button block round @click="dismiss">稍后再说</van-button>
        <van-button type="primary" block round @click="install"
          >立即安装</van-button
        >
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const showPrompt = ref(false);
const deferredPrompt = ref(null);

// 检查是否已经安装
const isInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

// 检查是否已经拒绝过
const isDismissed = () => {
  const dismissed = localStorage.getItem("pwa_install_dismissed");
  if (!dismissed) return false;

  // 7天后再次提示
  const dismissedTime = parseInt(dismissed, 10);
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedTime < sevenDays;
};

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault();
  deferredPrompt.value = e;

  // 如果已安装或已拒绝，不显示提示
  if (!isInstalled() && !isDismissed()) {
    // 延迟显示，避免页面加载时立即弹出
    setTimeout(() => {
      showPrompt.value = true;
    }, 3000);
  }
};

const install = async () => {
  if (!deferredPrompt.value) return;

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;

  console.log("PWA 安装结果:", outcome);
  deferredPrompt.value = null;
  showPrompt.value = false;
};

const dismiss = () => {
  showPrompt.value = false;
  localStorage.setItem("pwa_install_dismissed", Date.now().toString());
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  // 监听安装成功事件
  window.addEventListener("appinstalled", () => {
    console.log("PWA 已安装");
    deferredPrompt.value = null;
    showPrompt.value = false;
  });
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
});
</script>

<style lang="less" scoped>
.pwa-install-prompt {
  padding: 20px;
  background: #fff;
}

.prompt-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;

  .prompt-icon {
    width: 48px;
    height: 48px;
    background: #f0f7ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .prompt-info {
    flex: 1;

    h3 {
      margin: 0 0 4px;
      font-size: 17px;
      font-weight: 600;
      color: #323233;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #969799;
    }
  }

  .close-btn {
    font-size: 20px;
    color: #c8c9cc;
    cursor: pointer;
  }
}

.prompt-features {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 20px;
  background: #f7f8fa;
  border-radius: 8px;

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #646566;
  }
}

.prompt-actions {
  display: flex;
  gap: 12px;

  .van-button {
    flex: 1;
    height: 44px;
  }
}
</style>
