<template>
  <div class="login-page">
    <div class="login-header">
      <h1 class="title">单词速记</h1>
      <p class="subtitle">邮箱验证码登录</p>
    </div>

    <div class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="form.email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          left-icon="envelop-o"
          clearable
          :rules="[{ required: true, message: '请输入邮箱' }]"
        />

        <van-field
          v-model="form.code"
          label="验证码"
          placeholder="请输入6位验证码"
          left-icon="shield-o"
          maxlength="6"
          clearable
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="!canSendCode"
              :loading="sendingCode"
              @click="handleSendCode"
            >
              {{ sendButtonText }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="login-button">
        <van-button
          type="primary"
          block
          round
          size="large"
          :loading="logging"
          :disabled="!canLogin"
          @click="handleLogin"
        >
          登录
        </van-button>
      </div>
    </div>

    <div class="login-tips">
      <p>📧 首次登录将自动创建账号</p>
      <p>🔒 验证码有效期为5分钟</p>
      <p>⏰ 同一邮箱1分钟内只能发送一次</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast, showSuccessToast } from "vant";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 表单数据
const form = ref({
  email: "",
  code: "",
});

// 状态
const sendingCode = ref(false);
const logging = ref(false);
const countdown = ref(0);
let timer = null;

// 计算属性
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const canSendCode = computed(() => {
  return (
    emailRegex.test(form.value.email) &&
    countdown.value === 0 &&
    !sendingCode.value
  );
});

const canLogin = computed(() => {
  return emailRegex.test(form.value.email) && /^\d{6}$/.test(form.value.code);
});

const sendButtonText = computed(() => {
  if (sendingCode.value) return "发送中";
  if (countdown.value > 0) return `${countdown.value}s`;
  return "发送验证码";
});

// 发送验证码
async function handleSendCode() {
  if (!canSendCode.value) return;

  try {
    sendingCode.value = true;
    await userStore.sendCode(form.value.email);
    showSuccessToast("验证码已发送");
    startCountdown();
  } catch (error) {
    showToast(error.message || "发送失败");
  } finally {
    sendingCode.value = false;
  }
}

// 倒计时
function startCountdown() {
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

// 登录
async function handleLogin() {
  if (!canLogin.value) return;

  try {
    logging.value = true;
    await userStore.login(form.value.email, form.value.code);
    showSuccessToast("登录成功");

    const redirect = route.query.redirect || "/";
    router.replace(redirect);
  } catch (error) {
    showToast(error.message || "登录失败");
  } finally {
    logging.value = false;
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  color: #fff;

  .title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 15px;
    opacity: 0.9;
    margin: 0;
  }
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  :deep(.van-cell-group--inset) {
    margin: 0;
  }

  :deep(.van-field) {
    padding: 10px 0;
  }

  :deep(.van-field__label) {
    font-size: 14px;
  }

  :deep(.van-field__control) {
    font-size: 14px;
  }
}

.login-button {
  margin-top: 20px;

  :deep(.van-button) {
    height: 44px;
    font-size: 15px;
    font-weight: 500;
  }
}

.login-tips {
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  text-align: center;

  p {
    margin: 6px 0;
  }
}

/* 平板设备 (iPad Pro 等) */
@media (min-width: 768px) and (max-width: 1200px) {
  .login-header {
    margin-bottom: 24px;

    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 13px;
    }
  }

  .login-form {
    max-width: 360px;
    padding: 18px;
    border-radius: 14px;

    :deep(.van-field) {
      padding: 9px 0;
    }

    :deep(.van-field__label) {
      font-size: 13px;
    }

    :deep(.van-field__control) {
      font-size: 13px;
    }

    :deep(.van-button--small) {
      font-size: 12px;
      padding: 0 10px;
      height: 28px;
    }
  }

  .login-button {
    margin-top: 16px;

    :deep(.van-button) {
      height: 40px;
      font-size: 14px;
    }
  }

  .login-tips {
    margin-top: 20px;
    font-size: 11px;

    p {
      margin: 5px 0;
    }
  }
}

/* 手机设备 */
@media (max-width: 767px) {
  .login-header {
    margin-bottom: 28px;

    .title {
      font-size: 26px;
    }

    .subtitle {
      font-size: 14px;
    }
  }

  .login-form {
    max-width: 100%;
    padding: 18px;

    :deep(.van-field) {
      padding: 9px 0;
    }

    :deep(.van-field__label) {
      font-size: 13px;
    }

    :deep(.van-field__control) {
      font-size: 13px;
    }
  }

  .login-button {
    margin-top: 18px;

    :deep(.van-button) {
      height: 42px;
      font-size: 14px;
    }
  }

  .login-tips {
    margin-top: 24px;
    font-size: 11px;
  }
}
</style>
