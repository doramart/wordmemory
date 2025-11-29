import axios from "axios";
import { showToast } from "vant";

const request = axios.create({
  baseURL: "/api",
  timeout: 30000 * 10,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pwa_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 业务错误
    if (data.code && data.code !== 200 && data.code !== 0) {
      const message = data.message || "请求失败";
      showToast(message);
      return Promise.reject(new Error(message));
    }

    return data;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Token 过期，清除登录状态
          localStorage.removeItem("pwa_auth_token");
          localStorage.removeItem("pwa_user_info");
          window.location.href = "/login";
          break;
        case 403:
          showToast("没有权限访问");
          break;
        case 404:
          showToast("请求的资源不存在");
          break;
        case 500:
          showToast("服务器错误");
          break;
        default:
          showToast(data?.message || "请求失败");
      }
    } else {
      showToast("网络连接失败");
    }

    return Promise.reject(error);
  }
);

export default request;
