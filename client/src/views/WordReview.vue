<template>
  <div class="word-review word-layout">
    <van-sticky>
      <van-nav-bar title="单词列表" fixed safe-area-inset-top />
      <div class="sticky-header">
        <van-search
          v-model="searchQuery"
          placeholder="搜索单词或释义"
          clearable
          background="#fff"
          shape="round"
        />
        <van-tabs v-model:active="statusFilter" type="card" class="filter-tabs">
          <van-tab title="全部" name="all" />
          <van-tab title="需复习" name="failed" />
          <van-tab title="已掌握" name="passed" />
          <van-tab title="未学习" name="unlearned" />
        </van-tabs>
      </div>
    </van-sticky>

    <div class="review-body">
      <van-loading
        v-if="loading"
        size="24px"
        type="spinner"
        class="mt-12 text-center"
      />

      <van-empty
        v-else-if="words.length === 0"
        description="暂无单词，快去添加吧"
      />

      <van-empty
        v-else-if="filteredWords.length === 0"
        description="未找到匹配的单词"
        image="search"
      />

      <template v-else>
        <van-index-bar
          :index-list="indexList"
          :sticky="true"
          :sticky-offset-top="110"
        >
          <div v-for="group in groupedWords" :key="group.letter">
            <van-index-anchor :index="group.letter">
              {{ group.letter }}
              <span class="text-xs text-gray">({{ group.items.length }})</span>
            </van-index-anchor>

            <van-cell
              v-for="word in group.items"
              :key="word._id"
              clickable
              @click="jumpToLearn(word._id)"
            >
              <template #title>
                <div class="cell-title">
                  <span class="word-text">{{ word.word }}</span>
                  <span class="word-phonetic">{{ word.phonetic }}</span>
                  <van-tag
                    size="small"
                    :type="statusTagType(getWordStatus(word._id))"
                    plain
                  >
                    {{ statusText(getWordStatus(word._id)) }}
                  </van-tag>
                </div>
              </template>
              <template #label>
                <div class="word-meaning">{{ word.meaning }}</div>
                <div v-if="getWordProgress(word._id)" class="word-meta">
                  <span v-if="getWordProgress(word._id).attempts > 0">
                    复习 {{ getWordProgress(word._id).attempts }} 次
                  </span>
                  <span v-if="getWordProgress(word._id).lastReviewed">
                    · 上次
                    {{ formatDate(getWordProgress(word._id).lastReviewed) }}
                  </span>
                </div>
              </template>
              <template #right-icon>
                <van-space direction="vertical" size="6">
                  <van-button
                    size="mini"
                    type="primary"
                    plain
                    @click.stop="jumpToLearn(word._id)"
                  >
                    去学习
                  </van-button>
                  <van-button
                    size="mini"
                    type="danger"
                    plain
                    @click.stop="deleteWord(word._id)"
                  >
                    删除
                  </van-button>
                </van-space>
              </template>
            </van-cell>
          </div>
        </van-index-bar>
      </template>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { wordApi, progressApi } from "@/api/wordmemory";

export default {
  name: "WordReview",
  setup() {
    const router = useRouter();
    const words = ref([]);
    const loading = ref(true);
    const searchQuery = ref("");
    const alphabet = ref("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
    const progressMap = ref(new Map());
    const statusFilter = ref("all");

    const loadProgress = async () => {
      try {
        const response = await progressApi.getAll();
        const map = new Map();
        (response.data || []).forEach((progress) => {
          map.set(progress.wordId._id || progress.wordId, progress);
        });
        progressMap.value = map;
      } catch (error) {
        console.error("Failed to load progress:", error);
        showFailToast("加载进度失败");
      }
    };

    const loadWords = async () => {
      try {
        loading.value = true;
        const response = await wordApi.getAll();
        words.value = response.data || [];
        await loadProgress();
      } catch (error) {
        console.error("Failed to load words:", error);
        showFailToast("加载单词失败");
      } finally {
        loading.value = false;
      }
    };

    const getWordStatus = (wordId) => {
      const progress = progressMap.value.get(wordId);
      if (!progress) return "unlearned";
      return progress.status;
    };

    const getWordProgress = (wordId) => {
      return progressMap.value.get(wordId);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "今天";
      if (days === 1) return "昨天";
      if (days < 7) return `${days}天前`;

      return date.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      });
    };

    const filteredWords = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      let filtered = [...words.value];

      if (statusFilter.value !== "all") {
        filtered = filtered.filter(
          (word) => getWordStatus(word._id) === statusFilter.value
        );
      }

      if (query) {
        filtered = filtered.filter((word) => {
          const wordText = (word.word || "").toLowerCase();
          const meaningText = (word.meaning || "").toLowerCase();
          return wordText.includes(query) || meaningText.includes(query);
        });
      }

      return filtered.sort((a, b) =>
        (a.word || "").localeCompare(b.word || "", "en", {
          sensitivity: "base",
        })
      );
    });

    const groupedWords = computed(() => {
      const buckets = {};
      [...alphabet.value, "#"].forEach((letter) => {
        buckets[letter] = [];
      });

      filteredWords.value.forEach((word) => {
        const firstChar = word.word?.charAt(0) || "";
        const letter = /^[a-zA-Z]/.test(firstChar)
          ? firstChar.toUpperCase()
          : "#";
        buckets[letter].push(word);
      });

      return [...alphabet.value, "#"]
        .map((letter) => ({
          letter,
          items: buckets[letter] || [],
        }))
        .filter((group) => group.items.length > 0);
    });

    const indexList = computed(() => groupedWords.value.map((g) => g.letter));

    const jumpToLearn = (wordId) => {
      router.push({ path: "/words/learn", query: { wordId } });
    };

    const deleteWord = async (id) => {
      try {
        await showConfirmDialog({
          title: "确认删除",
          message: "删除后不可恢复，确定删除吗？",
        });
        await wordApi.delete(id);
        await loadWords();
        showSuccessToast("删除成功");
      } catch (error) {
        if (error?.message !== "cancel") {
          console.error("Failed to delete word:", error);
          showFailToast("删除单词失败");
        }
      }
    };

    const statusText = (status) => {
      if (status === "failed") return "需复习";
      if (status === "passed") return "已掌握";
      return "未学习";
    };

    const statusTagType = (status) => {
      if (status === "failed") return "danger";
      if (status === "passed") return "success";
      return "primary";
    };

    onMounted(() => {
      loadWords();
    });

    return {
      words,
      loading,
      searchQuery,
      statusFilter,
      filteredWords,
      groupedWords,
      indexList,
      getWordStatus,
      getWordProgress,
      formatDate,
      deleteWord,
      jumpToLearn,
      statusText,
      statusTagType,
    };
  },
};
</script>

<style scoped>
.word-review {
  padding-bottom: 50px;
}

.sticky-header {
  background: #fff;
  padding-bottom: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.filter-tabs {
  margin-top: 4px;
  padding: 0 12px;
}

.review-body {
  padding-bottom: 80px;
}

.text-center {
  text-align: center;
  width: 100%;
  padding: 20px;
}

.mt-12 {
  margin-top: 12px;
}

.text-xs {
  font-size: 12px;
}

.text-gray {
  color: #969799;
}

.cell-title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.word-text {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-main);
}

.word-phonetic {
  color: var(--text-light);
  font-size: 12px;
  font-family: monospace;
}

.word-meaning {
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}

.word-meta {
  font-size: 11px;
  color: var(--text-light);
  margin-top: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}

/* 平板设备 (iPad Pro 等) */
@media (min-width: 768px) and (max-width: 1200px) {
  .word-text {
    font-size: 14px;
  }

  .word-phonetic {
    font-size: 11px;
  }

  .word-meaning {
    font-size: 12px;
  }

  .word-meta {
    font-size: 10px;
  }

  :deep(.van-cell) {
    padding: 10px 16px;
  }

  :deep(.van-button--mini) {
    font-size: 11px;
    padding: 0 8px;
    height: 24px;
  }

  :deep(.van-tag--small) {
    font-size: 10px;
    padding: 0 4px;
  }

  :deep(.van-index-anchor) {
    font-size: 13px;
    padding: 0 12px;
  }

  :deep(.van-search__content) {
    padding-left: 12px;
  }

  :deep(.van-field__control) {
    font-size: 14px;
  }
}

/* 手机设备 */
@media (max-width: 767px) {
  .word-text {
    font-size: 14px;
  }

  .word-phonetic {
    font-size: 11px;
  }

  .word-meaning {
    font-size: 12px;
  }

  .word-meta {
    font-size: 10px;
  }
}
</style>
