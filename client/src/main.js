import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

// 移动端适配
import "amfe-flexible";

// Vant 样式
import "vant/lib/index.css";
import "./styles/wordmemory.less";

// 全局样式
import "./styles/index.less";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
