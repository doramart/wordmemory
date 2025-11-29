import request from "./request";

export const authApi = {
  // 发送验证码
  sendCode(email) {
    return request.post("/auth/send-code", { email });
  },

  // 登录
  login(email, code) {
    return request.post("/auth/login", { email, code });
  },

  // 退出登录
  logout() {
    return request.post("/auth/logout");
  },

  // 获取用户信息
  getProfile() {
    return request.get("/auth/profile");
  },

  // 刷新 Token
  refreshToken() {
    return request.post("/auth/refresh-token");
  },
};
