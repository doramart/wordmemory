import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api/auth";

const STORAGE_KEYS = {
  TOKEN: "pwa_auth_token",
  USER: "pwa_user_info",
};

export const useUserStore = defineStore("user", () => {
  // State
  const token = ref(null);
  const user = ref(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const userEmail = computed(() => user.value?.email || "");
  const userName = computed(
    () => user.value?.nickname || user.value?.email?.split("@")[0] || ""
  );
  const userAvatar = computed(() => user.value?.avatar || "");

  // Actions
  async function init() {
    if (initialized.value) return;

    try {
      // 从本地存储恢复
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (savedToken) {
        token.value = savedToken;
      }
      if (savedUser) {
        user.value = JSON.parse(savedUser);
      }

      // 验证 token 有效性
      if (token.value) {
        try {
          const res = await authApi.getProfile();
          user.value = res.data;
          saveToStorage();
        } catch {
          clearAuth();
        }
      }
    } finally {
      initialized.value = true;
    }
  }

  async function sendCode(email) {
    const res = await authApi.sendCode(email);
    return res.data;
  }

  async function login(email, code) {
    loading.value = true;
    try {
      const res = await authApi.login(email, code);
      token.value = res.data.token;
      user.value = res.data.user;
      saveToStorage();
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // 忽略错误
    } finally {
      clearAuth();
    }
  }

  async function refreshToken() {
    try {
      const res = await authApi.refreshToken();
      token.value = res.data.token;
      saveToStorage();
      return res.data;
    } catch {
      clearAuth();
      throw new Error("Token 刷新失败");
    }
  }

  function saveToStorage() {
    if (token.value) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token.value);
    }
    if (user.value) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value));
    }
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  return {
    // State
    token,
    user,
    loading,
    initialized,
    // Getters
    isLoggedIn,
    userEmail,
    userName,
    userAvatar,
    // Actions
    init,
    sendCode,
    login,
    logout,
    refreshToken,
    clearAuth,
  };
});
