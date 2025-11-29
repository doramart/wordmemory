import { ref, computed, watch } from "vue";

const STORAGE_KEY = "study-display-mode";
const defaultMode = "full"; // full | wordOnly | meaningOnly
const mode = ref(defaultMode);

if (typeof window !== "undefined") {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "wordOnly" || saved === "meaningOnly" || saved === "full") {
    mode.value = saved;
  }
}

watch(
  mode,
  (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
  },
  { immediate: true }
);

const showImage = computed(() => mode.value === "full");
const showWord = computed(() => mode.value !== "meaningOnly");
const showMeaning = computed(() => mode.value !== "wordOnly");
const showPhonetic = computed(() => mode.value === "full");
const showExample = computed(() => mode.value === "full");

export function useStudyMode() {
  const setMode = (value) => {
    if (value === "full" || value === "wordOnly" || value === "meaningOnly") {
      mode.value = value;
    }
  };

  return {
    mode,
    setMode,
    showImage,
    showWord,
    showMeaning,
    showPhonetic,
    showExample,
  };
}
