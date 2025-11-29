<template>
  <div class="container learn-container">
    <!-- <StudyDisplayToggle /> -->

    <transition name="fade" mode="out-in">
      <!-- Loading State -->
      <div v-if="loading" class="loading-wrapper" key="loading">
        <van-loading vertical color="#1989fa" size="24px"
          >准备单词中...</van-loading
        >
      </div>

      <!-- Empty State -->
      <div v-else-if="!currentWord" class="empty-wrapper" key="empty">
        <van-empty
          :image="hasAnyWords ? 'default' : 'search'"
          :description="
            hasAnyWords ? '待复习的单词都学完啦' : '还没有单词哦，快去添加吧'
          "
        >
          <template #bottom>
            <div class="empty-actions">
              <van-button
                v-if="hasAnyWords"
                plain
                type="primary"
                round
                block
                @click="resetProgress"
                class="mb-16"
              >
                重置进度 (重新学习)
              </van-button>
              <van-button type="primary" round block to="/words/manage">
                去添加新单词
              </van-button>
            </div>
          </template>
        </van-empty>
      </div>

      <!-- Word Card -->
      <div
        v-else
        class="card word-card"
        :class="{ 'shake-animation': isShake }"
        key="card"
      >
        <div class="card-inner">
          <div v-if="showImage" class="word-image-container">
            <van-image
              v-if="currentWord.imageUrl"
              fit="cover"
              width="100%"
              height="100%"
              :src="currentWord.imageUrl"
              class="word-image"
            >
              <template #loading>
                <van-loading type="spinner" size="20" />
              </template>
              <template #error>
                <div class="image-error">
                  <van-icon name="photo-fail" size="30" color="#dcdee0" />
                  <span>加载失败</span>
                </div>
              </template>
            </van-image>

            <div v-else class="word-image-placeholder">
              <van-icon name="photo-o" size="40" color="#dcdee0" />
              <span class="placeholder-text">暂无图片</span>
            </div>

            <van-button
              round
              class="generate-btn"
              :loading="generating"
              @click="generateImage"
              size="small"
            >
              <template #icon>
                <span style="font-size: 16px">🎨</span>
              </template>
            </van-button>
          </div>

          <div class="word-content">
            <div class="word-header" v-if="showWord">
              <h1 class="word-title">{{ currentWord.word }}</h1>
              <van-button
                v-if="showPhonetic && currentWord.phonetic"
                round
                size="small"
                color="var(--accent-color)"
                class="audio-btn"
                @click="playAudio"
              >
                <template #icon>🔊</template>
              </van-button>
            </div>

            <div
              v-if="showPhonetic && currentWord.phonetic"
              class="phonetic-tag"
            >
              {{ currentWord.phonetic }}
            </div>

            <div class="meaning-box" v-if="showMeaning && currentWord.meaning">
              {{ currentWord.meaning }}
            </div>

            <div class="example-box" v-if="showExample && currentWord.example">
              <p class="example-text">{{ currentWord.example }}</p>
            </div>
          </div>
        </div>

        <div class="controls">
          <van-button
            type="danger"
            size="large"
            class="action-btn"
            @click="handleUnknown"
            block
          >
            <template #icon>🤔</template>
            不认识
          </van-button>
          <van-button
            type="success"
            size="large"
            class="action-btn"
            @click="handleKnown"
            block
          >
            <template #icon>💡</template>
            认识啦
          </van-button>
        </div>

        <div class="secondary-controls">
          <van-button
            plain
            type="default"
            size="small"
            @click="prevWord"
            :disabled="currentIndex === 0"
            style="border: none; color: var(--text-light)"
          >
            ← 上一个
          </van-button>
          <van-button
            plain
            type="default"
            size="small"
            @click="nextWord"
            style="border: none; color: var(--text-light)"
          >
            跳过 →
          </van-button>
        </div>

        <div class="progress-section">
          <van-progress
            :percentage="progressPercentage"
            :show-pivot="false"
            stroke-width="6"
            color="var(--primary-color)"
            track-color="#f0f2f5"
          />
          <div class="progress-text">
            进度: {{ words.length ? currentIndex + 1 : 0 }} / {{ words.length }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { showFailToast } from "vant";
import { wordApi, progressApi, imageApi } from "@/api/wordmemory";
import { useStudyMode } from "@/composables/useStudyMode";
import StudyDisplayToggle from "@/components/StudyDisplayToggle.vue";

const route = useRoute();
const words = ref([]);
const currentIndex = ref(0);
const currentWord = ref(null);
const loading = ref(true);
const generating = ref(false);
const isShake = ref(false);
const hasAnyWords = ref(false);

const { showImage, showWord, showMeaning, showPhonetic, showExample } =
  useStudyMode();

const progressPercentage = computed(() => {
  if (words.value.length === 0) return 0;
  return ((currentIndex.value + 1) / words.value.length) * 100;
});

const setCurrentById = (id) => {
  if (!id || !words.value.length) return;
  const idx = words.value.findIndex((w) => w._id === id);
  if (idx !== -1) {
    currentIndex.value = idx;
    currentWord.value = words.value[idx];
  }
};

const loadWords = async () => {
  try {
    loading.value = true;
    const [wordsRes, progressRes] = await Promise.all([
      wordApi.getAll(),
      progressApi.getAll(),
    ]);

    const allWords = wordsRes.data || [];
    hasAnyWords.value = allWords.length > 0;

    const progressMap = new Map(
      (progressRes.data || []).map((p) => [p.wordId._id || p.wordId, p])
    );

    const targetId = route.query.wordId;
    let filteredWords = allWords.filter((word) => {
      if (targetId && word._id === targetId) return true;
      const p = progressMap.get(word._id);
      return !p || p.status !== "passed";
    });

    filteredWords.sort((a, b) => {
      if (targetId) {
        if (a._id === targetId) return -1;
        if (b._id === targetId) return 1;
      }

      const pA = progressMap.get(a._id);
      const pB = progressMap.get(b._id);
      const isAFailed = pA?.status === "failed";
      const isBFailed = pB?.status === "failed";

      if (isAFailed && !isBFailed) return -1;
      if (!isAFailed && isBFailed) return 1;
      return 0;
    });

    words.value = filteredWords;

    if (words.value.length > 0) {
      if (targetId) {
        const idx = words.value.findIndex((w) => w._id === targetId);
        if (idx !== -1) {
          currentIndex.value = idx;
          currentWord.value = words.value[idx];
        } else {
          currentWord.value = words.value[0];
        }
      } else {
        currentWord.value = words.value[0];
      }
    } else {
      currentWord.value = null;
    }
  } catch (error) {
    console.error("Failed to load words:", error);
    showFailToast(error.message || "加载单词失败");
  } finally {
    loading.value = false;
  }
};

const nextWord = () => {
  if (!words.value.length) return;
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
  currentWord.value = words.value[currentIndex.value];
};

const prevWord = () => {
  if (!words.value.length) return;
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = words.value.length - 1;
  }
  currentWord.value = words.value[currentIndex.value];
};

const markWord = async (status) => {
  try {
    await progressApi.update(currentWord.value._id, { status });
    nextWord();
  } catch (error) {
    console.error("Failed to update progress:", error);
    showFailToast("更新进度失败");
  }
};

const handleKnown = async () => {
  await markWord("passed");
};

const handleUnknown = async () => {
  isShake.value = true;
  setTimeout(() => {
    isShake.value = false;
  }, 500);
  await markWord("failed");
};

watch(
  () => route.query.wordId,
  (id) => {
    if (id) {
      setCurrentById(id);
    }
  }
);

const generateImage = async () => {
  try {
    generating.value = true;
    const response = await imageApi.generate(currentWord.value._id);
    currentWord.value.imageUrl = response.data?.imageUrl;
  } catch (error) {
    console.error("Failed to generate image:", error);
    showFailToast(error.response?.data?.details || "生成图片失败");
  } finally {
    generating.value = false;
  }
};

const playAudio = () => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(currentWord.value.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("您的浏览器不支持语音功能");
  }
};

const resetProgress = async () => {
  if (!confirm("确定要重置所有学习进度吗？此操作不可恢复！")) return;
  try {
    loading.value = true;
    await progressApi.resetAll();
    window.location.reload();
  } catch (error) {
    console.error("Failed to reset progress:", error);
    showFailToast(error.response?.data?.error || "重置失败");
    loading.value = false;
  }
};

onMounted(() => {
  loadWords();
});
</script>

<style scoped>
.learn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  min-height: calc(100vh - 100px);
}

.loading-wrapper,
.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.empty-actions {
  width: 200px;
  margin: 0 auto;
}

.mb-16 {
  margin-bottom: 16px;
}

.word-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 4px solid #fff;
  width: 100%;
}

.card-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.word-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #f0f2f5;
  overflow: hidden;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.word-image {
  display: block;
}

.word-image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.placeholder-text {
  margin-top: 8px;
  color: var(--text-light);
  font-size: 14px;
}

.generate-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  border: none;
}

.word-content {
  padding: 24px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.word-title {
  font-size: 36px;
  color: var(--text-main);
  margin: 0;
  font-family: "Varela Round", sans-serif;
}

.audio-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phonetic-tag {
  font-size: 16px;
  color: var(--text-secondary);
  font-family: "Courier New", monospace;
  margin-bottom: 16px;
  background: #f1f2f6;
  display: inline-block;
  padding: 4px 12px;
  border-radius: 10px;
  align-self: center;
}

.meaning-box {
  font-size: 20px;
  color: var(--text-main);
  font-weight: 700;
  margin-bottom: 16px;
  padding: 8px;
}

.example-box {
  font-size: 16px;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: var(--radius-sm);
}

.controls {
  padding: 0 24px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
}

.secondary-controls {
  display: flex;
  justify-content: space-between;
  padding: 0 24px 16px;
}

.progress-section {
  width: 100%;
}

.progress-text {
  text-align: center;
  padding: 8px;
  color: var(--text-light);
  font-size: 12px;
  background: #f8f9fa;
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* 平板设备 (iPad Pro 等) */
@media (min-width: 768px) and (max-width: 1200px) {
  .word-image-container {
    aspect-ratio: 16/10;
  }

  .word-title {
    font-size: 28px;
  }

  .phonetic-tag {
    font-size: 14px;
  }

  .meaning-box {
    font-size: 18px;
  }

  .example-box {
    font-size: 14px;
  }

  .word-content {
    padding: 20px;
  }

  .action-btn {
    height: 44px;
    font-size: 15px;
  }

  .controls {
    padding: 0 20px 16px;
  }
}

/* 手机设备 */
@media (max-width: 767px) {
  .word-image-container {
    aspect-ratio: 4/3;
  }

  .word-title {
    font-size: 28px;
  }

  .phonetic-tag {
    font-size: 14px;
  }

  .meaning-box {
    font-size: 18px;
  }

  .example-box {
    font-size: 14px;
  }

  .word-content {
    padding: 16px;
  }

  .controls {
    padding: 0 16px 16px;
  }

  .action-btn {
    height: 44px;
    font-size: 15px;
  }
}
</style>
