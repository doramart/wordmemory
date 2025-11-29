import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

const routes = [
  {
    path: "/",
    component: () => import("@/views/WordLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/words/learn",
      },
      {
        path: "/words/learn",
        name: "WordLearn",
        component: () => import("@/views/WordLearn.vue"),
        meta: { title: "单词学习", requiresAuth: true },
      },
      {
        path: "/words/manage",
        name: "WordManage",
        component: () => import("@/views/WordManage.vue"),
        meta: { title: "添加单词", requiresAuth: true },
      },
      {
        path: "/words/review",
        name: "WordReview",
        component: () => import("@/views/WordReview.vue"),
        meta: { title: "单词列表", requiresAuth: true },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录", guest: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/words/learn",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 单词速记` : "单词速记";

  const userStore = useUserStore();

  // 等待初始化完成
  if (!userStore.initialized) {
    await userStore.init();
  }

  const isLoggedIn = userStore.isLoggedIn;

  // 需要登录但未登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  // 已登录访问游客页面
  if (to.meta.guest && isLoggedIn) {
    next("/");
    return;
  }

  next();
});

export default router;
