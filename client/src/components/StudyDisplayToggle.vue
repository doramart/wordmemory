<template>
  <div class="study-toggle">
    <van-popover v-model:show="expanded" placement="bottom-start" theme="light">
      <div class="popover-content">
    
        <van-grid :column-num="3" :border="false" clickable>
          <van-grid-item
            v-for="option in options"
            :key="option.value"
            @click="selectMode(option.value)"
            :class="{ active: mode === option.value }"
          >
            <template #icon>
              <span class="grid-icon">{{ option.icon }}</span>
            </template>
            <template #text>
              <span class="grid-text">{{ option.label }}</span>
            </template>
          </van-grid-item>
        </van-grid>
      </div>
      <template #reference>
        <van-button
          round
          icon="setting-o"
          class="settings-btn"
          :type="expanded ? 'primary' : 'default'"
        />
      </template>
    </van-popover>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStudyMode } from "@/composables/useStudyMode";

const { mode: modeRef, setMode } = useStudyMode();
const mode = computed(() => modeRef.value);
const expanded = ref(false);

const options = [
  { value: "full", label: "完整显示", icon: "🖼️" },
  { value: "wordOnly", label: "只看单词", icon: "🔤" },
  { value: "meaningOnly", label: "只看中文", icon: "🈶" },
];

const selectMode = (value) => {
  setMode(value);
  expanded.value = false;
};
</script>

<style scoped>
.study-toggle {
  position: fixed;
  left: 16px;
  top: 16px;
  z-index: 1200;
}

.settings-btn {
  width: 44px;
  height: 44px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.popover-content {
  width: 280px;
  padding: 8px 0;
}

.popover-header {
  padding: 8px 16px;
  border-bottom: 1px solid #f5f6f7;
  margin-bottom: 8px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.grid-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.grid-text {
  font-size: 12px;
  color: #646566;
}

.active .grid-text {
  color: var(--van-primary-color);
  font-weight: 600;
}

:deep(.van-grid-item__content) {
  padding: 12px 8px;
  border-radius: 8px;
  margin: 0 4px;
}

:deep(.active .van-grid-item__content) {
  background-color: var(--van-primary-color-light);
}

@media (max-width: 768px) {
  .study-toggle {
    left: 12px;
    top: 12px;
  }
  
  .settings-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
