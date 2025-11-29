<template>
  <div class="word-layout">
    <header class="layout-header">
      <div class="header-content">
        <div class="brand-block">
          <h1>单词速记</h1>
          <span class="version-tag">AI</span>
        </div>

        <van-popover
          v-model:show="showMenu"
          placement="bottom-end"
          :actions="menuActions"
          @select="onSelectMenu"
        >
          <template #reference>
            <div class="user-profile">
              <span class="user-name">{{ userName }}</span>
              <div class="avatar">
                <van-icon name="manager" />
              </div>
            </div>
          </template>
        </van-popover>
      </div>
    </header>

    <main class="layout-main">
      <router-view />
    </main>

    <van-tabbar route fixed safe-area-inset-bottom>
      <van-tabbar-item replace to="/words/learn" icon="fire-o">
        学习
      </van-tabbar-item>
      <van-tabbar-item replace to="/words/manage" icon="add-o">
        添加
      </van-tabbar-item>
      <van-tabbar-item replace to="/words/review" icon="records">
        列表
      </van-tabbar-item>
    </van-tabbar>

    <!-- Mode Selection Action Sheet -->
    <van-action-sheet
      v-model:show="showModeSheet"
      :actions="modeActions"
      cancel-text="取消"
      description="选择记忆模式"
      close-on-click-action
      @select="onSelectMode"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showFailToast } from "vant";
import { useUserStore } from "@/stores/user";
import { authApi } from "@/api/auth";
import { useStudyMode } from "@/composables/useStudyMode";

const router = useRouter();
const userStore = useUserStore();
const { setMode, mode } = useStudyMode();

const userName = computed(() => userStore.userName || "学习者");
const showMenu = ref(false);
const showModeSheet = ref(false);

const menuActions = [
  { text: "记忆模式", icon: "setting-o", id: "mode" },
  { text: "退出登录", icon: "revoke", id: "logout", color: "#ee0a24" },
];

const modeActions = computed(() => [
  {
    name: "完整显示",
    subname: "显示所有内容",
    value: "full",
    color: mode.value === "full" ? "#1989fa" : undefined,
  },
  {
    name: "只看单词",
    subname: "隐藏释义和例句",
    value: "wordOnly",
    color: mode.value === "wordOnly" ? "#1989fa" : undefined,
  },
  {
    name: "只看中文",
    subname: "隐藏单词拼写",
    value: "meaningOnly",
    color: mode.value === "meaningOnly" ? "#1989fa" : undefined,
  },
]);

const onSelectMenu = (action) => {
  if (action.id === "logout") {
    handleLogout();
  } else if (action.id === "mode") {
    showModeSheet.value = true;
  }
};

const onSelectMode = (action) => {
  setMode(action.value);
};

const handleLogout = () => {
  showConfirmDialog({
    title: "确认退出",
    message: "确定要退出登录吗？",
  })
    .then(async () => {
      try {
        await userStore.logout();
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        // Even if API fails, we should probably clear local state and redirect
        await userStore.logout();
        router.push("/login");
      }
    })
    .catch(() => {
      // Cancelled
    });
};
</script>

<style lang="less" scoped>
.word-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-gradient);
}

.layout-header {
  color: #fff;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 20px rgba(79, 172, 254, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  font-family: "Varela Round", sans-serif;
  letter-spacing: -0.5px;
}

.version-tag {
  font-size: 9px;
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 5px;
  border-radius: 6px;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 3px 3px 12px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-profile:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.user-name {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.95;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4facfe;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.layout-main {
  flex: 1;
  padding: 16px 16px 80px;
}

:deep(.van-tabbar) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.02);
}

:deep(.van-tabbar-item__text) {
  font-weight: 600;
  font-size: 10px;
}

:deep(.van-tabbar-item--active) {
  background: transparent;
}

/* 平板设备 (iPad Pro 等) */
@media (min-width: 768px) and (max-width: 1200px) {
  .header-content {
    padding: 10px 20px;
  }

  h1 {
    font-size: 16px;
  }

  .version-tag {
    font-size: 8px;
    padding: 2px 4px;
  }

  .user-name {
    font-size: 11px;
  }

  .avatar {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .layout-main {
    padding: 16px 20px 90px;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  :deep(.van-tabbar-item__icon) {
    font-size: 18px;
  }

  :deep(.van-tabbar-item__text) {
    font-size: 10px;
  }

  :deep(.van-tabbar) {
    height: 52px;
  }
}

/* 桌面设备 */
@media (min-width: 1201px) {
  .layout-main {
    padding: 24px 32px 110px;
    max-width: 1024px;
    margin: 0 auto;
    width: 100%;
  }

  .header-content {
    padding: 16px 32px;
    max-width: 1024px;
    width: 100%;
  }
}

/* 手机设备 */
@media (max-width: 767px) {
  .header-content {
    padding: 10px 16px;
  }

  h1 {
    font-size: 16px;
  }

  .version-tag {
    font-size: 8px;
  }

  .user-name {
    font-size: 11px;
  }

  .avatar {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .layout-main {
    padding: 12px 12px 70px;
  }

  :deep(.van-tabbar-item__text) {
    font-size: 10px;
  }
}
</style>
