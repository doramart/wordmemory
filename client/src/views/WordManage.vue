<template>
  <div class="word-manage">
    <!-- <van-nav-bar
      title="单词管理"
      fixed
      placeholder
      safe-area-inset-top
      z-index="100"
    /> -->

    <div class="content-container">
      <!-- 概况卡片 -->
      <div class="stats-card">
        <div class="stats-info">
          <div class="stats-label">当前词库</div>
          <div class="stats-value">
            {{ words.length }} <span class="stats-unit">个</span>
          </div>
        </div>
        <div class="stats-tags">
          <van-tag color="#e8f3ff" text-color="#1989fa" round
            >AI 智能补全</van-tag
          >
          <van-tag color="#fff8e6" text-color="#ff976a" round>批量导入</van-tag>
        </div>
      </div>

      <!-- 单个添加表单 -->
      <div class="section-title">添加新单词</div>
      <van-form @submit="addWord" class="add-form">
        <van-cell-group class="add-word-panel" inset>
          <van-field
            v-model="newWord.word"
            name="word"
            label="单词"
            placeholder="输入英文单词"
            :rules="[{ required: true, message: '请输入单词' }]"
            clearable
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                plain
                hairline
                round
                :loading="generatingDetails"
                :disabled="!newWord.word"
                @click.stop.prevent="generateDetails"
              >
                <van-icon name="magic-wand" class="mr-1" />
                智能补全
              </van-button>
            </template>
          </van-field>

          <van-field
            v-model="newWord.phonetic"
            name="phonetic"
            label="音标"
            placeholder="例: /həˈləʊ/"
          />

          <van-field
            v-model="newWord.meaning"
            name="meaning"
            label="释义"
            placeholder="中文释义"
            type="textarea"
            autosize
            rows="1"
          />

          <van-field
            v-model="newWord.example"
            name="example"
            label="例句"
            type="textarea"
            rows="2"
            autosize
            placeholder="例句（可选）"
          />

          <van-field label="配图" class="upload-field">
            <template #input>
              <div class="upload-wrapper">
                <van-uploader
                  v-model="imageList"
                  :max-count="1"
                  accept="image/*"
                  :after-read="handleFileSelect"
                  :before-delete="removeImage"
                  :max-size="10 * 1024 * 1024"
                  capture="camera"
                  @oversize="onOversize"
                  class="custom-uploader"
                >
                  <div class="upload-placeholder">
                    <van-icon name="photograph" size="24" color="#dcdee0" />
                    <span class="text">上传图片</span>
                  </div>
                </van-uploader>

                <div class="ai-image-actions">
                  <van-popover
                    v-model:show="showAiActions"
                    :actions="aiActions"
                    placement="bottom"
                    @select="onAiActionSelect"
                  >
                    <template #reference>
                      <van-button
                        size="small"
                        type="primary"
                        plain
                        round
                        icon="magic-wand"
                        :loading="autoGenerating || customGenerating"
                      >
                        AI 生图
                      </van-button>
                    </template>
                  </van-popover>
                </div>
              </div>
            </template>
          </van-field>
        </van-cell-group>

        <div class="form-actions">
          <van-button
            type="primary"
            round
            block
            native-type="submit"
            :loading="submitting"
            color="linear-gradient(to right, #1989fa, #39b9f5)"
            shadow
          >
            确认添加
          </van-button>
        </div>
      </van-form>

      <!-- 批量导入 -->
      <div class="section-title">批量导入</div>
      <div class="batch-card">
        <div class="batch-header">
          <div class="batch-text">
            <h3>图片识别导入</h3>
            <p>上传单词表图片，AI 自动识别入库</p>
          </div>
          <van-icon
            name="scan"
            size="32"
            color="#1989fa"
            style="opacity: 0.2"
          />
        </div>

        <van-uploader
          :max-count="1"
          accept="image/*"
          :after-read="handleBatchUpload"
          :disabled="batchImporting"
          :max-size="10 * 1024 * 1024"
          :preview-image="false"
          capture="camera"
          class="batch-uploader-full"
          @oversize="onBatchOversize"
        >
          <div class="batch-upload-area" :class="{ importing: batchImporting }">
            <template v-if="batchImporting">
              <van-loading type="spinner" color="#1989fa" vertical
                >识别中...</van-loading
              >
            </template>
            <template v-else>
              <van-button icon="plus" type="primary" plain block round dashed
                >选择图片</van-button
              >
            </template>
          </div>
        </van-uploader>

        <transition name="van-fade">
          <div v-if="batchMessage || batchError" class="batch-feedback">
            <van-notice-bar
              v-if="batchMessage"
              left-icon="passed"
              :text="batchMessage"
              color="#07c160"
              background="#e8f8f0"
              wrapable
            />
            <van-notice-bar
              v-if="batchError"
              left-icon="warning-o"
              :text="batchError"
              color="#ee0a24"
              background="#ffe1e1"
              wrapable
            />
          </div>
        </transition>
      </div>
    </div>

    <van-dialog
      v-model:show="showCustomPrompt"
      title="自定义生图"
      show-cancel-button
      :confirm-button-loading="customGenerating"
      :confirm-button-text="customGenerating ? generatingStage : '生成图片'"
      cancel-button-text="取消"
      :close-on-click-overlay="!customGenerating"
      @confirm="handleCustomGenerateImage"
      @closed="customPrompt = ''"
    >
      <div class="prompt-dialog">
        <p class="prompt-tip">
          根据你的灵感描述一个场景，系统会结合单词生成易记的插画。可用中文或英文，避免含有文字或敏感内容。
        </p>
        <van-field
          v-model="customPrompt"
          type="textarea"
          rows="4"
          autosize
          maxlength="100"
          show-word-limit
          placeholder="例如：把西兰花剥进鸡蛋壳里形成可爱的造型，柔和光线，简洁背景。"
          :border="false"
        />
      </div>
    </van-dialog>

    <!-- 裁剪弹窗 -->
    <van-popup
      v-model:show="showCropper"
      position="bottom"
      teleport="body"
      :style="{ height: '100%' }"
      class="cropper-popup"
      @closed="resetCropper"
    >
      <div class="cropper-container-wrapper">
        <div class="cropper-nav">
          <van-icon name="cross" size="24" color="#fff" @click="closeCropper" />
          <span class="title">调整图片</span>
          <van-button
            size="small"
            type="primary"
            @click="confirmCropAndUpload"
            :loading="cropping || uploading"
            >完成</van-button
          >
        </div>
        <div class="cropper-area">
          <img ref="cropperImage" :src="cropperImageUrl" alt="" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { showFailToast, showSuccessToast } from "vant";
import Cropper from "cropperjs";
import { imageApi, uploadApi, wordApi } from "@/api/wordmemory";
import "cropperjs/dist/cropper.css";

const words = ref([]);
const submitting = ref(false);
const generatingDetails = ref(false);
const batchImporting = ref(false);
const batchMessage = ref("");
const batchError = ref("");
const imageList = ref([]);
const showCropper = ref(false);
const cropperImage = ref(null);
const cropperInstance = ref(null);
const cropperImageUrl = ref("");
const selectedFile = ref(null);
const cropping = ref(false);
const uploading = ref(false);
const autoGenerating = ref(false);
const customGenerating = ref(false);
const showCustomPrompt = ref(false);
const customPrompt = ref("");
const generatingStage = ref("生成图片");
const showAiActions = ref(false);

const aiActions = [
  { text: "自动生图", id: "auto" },
  { text: "提示词生图", id: "custom" },
];

const newWord = ref({
  word: "",
  phonetic: "",
  meaning: "",
  example: "",
  imageUrl: "",
});

const loadWordCount = async () => {
  try {
    const response = await wordApi.getAll();
    words.value = response.data || [];
  } catch (error) {
    console.error("Failed to load words:", error);
    showFailToast("加载单词失败");
  }
};

const generateDetails = async () => {
  if (!newWord.value.word) return;
  try {
    generatingDetails.value = true;
    const { data } = await wordApi.generateDetails(newWord.value.word);
    newWord.value.phonetic = data?.phonetic || "";
    newWord.value.meaning = data?.meaning || "";
    newWord.value.example = data?.example || "";
  } catch (error) {
    console.error("Failed to generate details:", error);
    showFailToast(error.response?.data?.error || "生成失败，请稍后再试");
  } finally {
    generatingDetails.value = false;
  }
};

const addWord = async () => {
  try {
    submitting.value = true;
    await wordApi.create(newWord.value);
    newWord.value = {
      word: "",
      phonetic: "",
      meaning: "",
      example: "",
      imageUrl: "",
    };
    imageList.value = [];
    customPrompt.value = "";
    await loadWordCount();
    showSuccessToast("单词添加成功");
  } catch (error) {
    console.error("Failed to add word:", error);
    if (error.response?.data?.message === "单词已存在") {
      showFailToast("该单词已存在");
    } else {
      showFailToast(error.response?.data?.message || "添加单词失败");
    }
  } finally {
    submitting.value = false;
  }
};

const validateImageFile = (file) => {
  if (!file) return "请选择图片文件";
  if (!file.type?.startsWith("image/")) return "请选择图片文件";
  if (file.size > 10 * 1024 * 1024) return "图片大小不能超过 10MB";
  return "";
};

const handleFileSelect = async (file) => {
  resetCropper();
  const raw = file?.file || file;
  const errorMsg = validateImageFile(raw);
  if (errorMsg) {
    showFailToast(errorMsg);
    return;
  }

  selectedFile.value = raw;
  cropperImageUrl.value = URL.createObjectURL(raw);
  showCropper.value = true;

  await nextTick();

  // Ensure image is loaded before initializing cropper
  const img = cropperImage.value;
  if (img && img.complete) {
    initCropper();
  } else {
    img.onload = initCropper;
  }
};

const initCropper = () => {
  if (!cropperImage.value) return;

  cropperInstance.value?.destroy();
  cropperInstance.value = new Cropper(cropperImage.value, {
    viewMode: 1,
    dragMode: "move",
    autoCropArea: 0.8,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
  });

  // Set aspect ratio if needed, though we can do it in options too
  // cropperInstance.value.setAspectRatio(1);
};

const removeImage = () => {
  newWord.value.imageUrl = "";
  imageList.value = [];
  return true;
};

const applyGeneratedImage = (url) => {
  if (!url) {
    showFailToast("未获取到图片地址");
    return;
  }
  newWord.value.imageUrl = url;
  imageList.value = [{ url, status: "done", isImage: true }];
};

const handleAutoGenerateImage = async () => {
  if (!newWord.value.word) return;
  try {
    autoGenerating.value = true;
    const { data } = await imageApi.generateByText({
      word: newWord.value.word,
      meaning: newWord.value.meaning,
    });
    applyGeneratedImage(data?.imageUrl);
    showSuccessToast("图片已生成并上传");
  } catch (error) {
    console.error("auto generate fail:", error);
    showFailToast(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "自动生成失败，请稍后再试"
    );
  } finally {
    autoGenerating.value = false;
  }
};

const openCustomPrompt = () => {
  if (!newWord.value.word) {
    showFailToast("请先填写单词");
    return;
  }
  if (!customPrompt.value) {
    // customPrompt.value = `请为单词 "${newWord.value.word}" 生成便于记忆的画面，例如：${newWord.value.word} 出现在一个有趣的场景中。`;
  }
  showCustomPrompt.value = true;
};

const handleCustomGenerateImage = async () => {
  if (!customPrompt.value.trim()) {
    showFailToast("请先填写提示词");
    return;
  }
  try {
    customGenerating.value = true;
    generatingStage.value = "AI 优化提示词中...";

    const { data } = await imageApi.generateByCustom({
      word: newWord.value.word,
      meaning: newWord.value.meaning,
      prompt: customPrompt.value,
    });

    applyGeneratedImage(data?.imageUrl);
    showCustomPrompt.value = false;
    showSuccessToast("图片已生成并上传");
  } catch (error) {
    console.error("custom generate fail:", error);
    showFailToast(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "生成失败，请稍后再试"
    );
  } finally {
    customGenerating.value = false;
    generatingStage.value = "生成图片";
  }
};

const onAiActionSelect = (action) => {
  if (action.id === "auto") {
    handleAutoGenerateImage();
  } else if (action.id === "custom") {
    openCustomPrompt();
  }
};

const closeCropper = () => {
  showCropper.value = false;
};

const resetCropper = () => {
  cropperInstance.value?.destroy();
  cropperInstance.value = null;
  if (cropperImageUrl.value) {
    URL.revokeObjectURL(cropperImageUrl.value);
  }
  cropperImageUrl.value = "";
  selectedFile.value = null;
  cropping.value = false;
};

const confirmCropAndUpload = async () => {
  if (!cropperInstance.value || !selectedFile.value) return;
  const selection = cropperInstance.value.getCropperSelection?.();

  try {
    cropping.value = true;
    const canvas =
      (await selection?.$toCanvas?.({
        width: 800,
        height: 800,
        beforeDraw: (ctx) => {
          ctx.imageSmoothingQuality = "high";
        },
      })) ||
      cropperInstance.value.getCroppedCanvas({
        width: 800,
        height: 800,
        imageSmoothingQuality: "high",
      });

    if (!canvas) throw new Error("无法生成裁剪区域");

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("裁剪失败"));
        },
        selectedFile.value.type || "image/jpeg",
        0.92
      );
    });

    const croppedFile = new File([blob], selectedFile.value.name, {
      type: blob.type,
    });

    uploading.value = true;

    // Update status for single uploader if item exists
    if (imageList.value.length > 0) {
      imageList.value[0].status = "uploading";
      imageList.value[0].message = "上传中...";
    }

    const res = await uploadApi.uploadImage(croppedFile);
    const payload = res?.data || {};
    const url = payload.url || payload.data?.url || "";
    newWord.value.imageUrl = url;
    imageList.value = url ? [{ url, status: "done", isImage: true }] : [];
    showSuccessToast("图片上传成功");
    closeCropper();
  } catch (error) {
    console.error("upload fail:", error);
    if (imageList.value.length > 0) {
      imageList.value[0].status = "failed";
      imageList.value[0].message = "上传失败";
    }
    showFailToast(error.response?.data?.details || error.message || "上传失败");
  } finally {
    cropping.value = false;
    uploading.value = false;
  }
};

const handleBatchUpload = async (file) => {
  try {
    batchError.value = "";
    batchMessage.value = "";
    batchImporting.value = true;
    const response = await wordApi.importFromImage(file.file);
    const data = response.data || {};
    batchMessage.value = `已识别 ${data.total || 0} 项，新增 ${
      data.inserted || 0
    } 条，更新 ${data.updated || 0} 条`;
    await loadWordCount();
    showSuccessToast("批量导入完成");
  } catch (error) {
    console.error("batch import fail:", error);
    batchError.value =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "批量导入失败";
    showFailToast(batchError.value);
  } finally {
    batchImporting.value = false;
  }
};

const onBatchOversize = () => {
  showFailToast("图片大小不能超过 10MB");
};

const onOversize = () => {
  showFailToast("图片大小不能超过 10MB");
};

onMounted(() => {
  loadWordCount();
});

onBeforeUnmount(() => {
  resetCropper();
});
</script>

<style scoped>
.word-manage {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40px;
}

.content-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.stats-card {
  background: linear-gradient(135deg, #39b9f5, #1989fa);
  border-radius: 16px;
  padding: 16px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.stats-unit {
  font-size: 14px;
  font-weight: normal;
  opacity: 0.8;
}

.stats-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 10px 4px;
}

.add-form {
  margin-bottom: 24px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

.upload-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.ai-image-actions {
  display: flex;
  align-items: center;
  padding-top: 24px;
}

.upload-placeholder {
  width: 80px;
  height: 80px;
  background: #f7f8fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdee0;
}

.upload-placeholder .text {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.batch-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.batch-text h3 {
  margin: 0;
  font-size: 16px;
  color: #323233;
}

.batch-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #969799;
}

.batch-upload-area {
  margin-top: 12px;
}

.batch-feedback {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-dialog {
  padding: 8px 0 0;
}

.prompt-tip {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.5;
  padding: 16px;
}

/* Cropper */
.cropper-popup {
  background: #000;
}

.cropper-container-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cropper-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.cropper-nav .title {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.cropper-area {
  flex: 1;
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-area img {
  display: block;
  max-width: 100%;
}

.mr-1 {
  margin-right: 4px;
}

:deep(.cropper-container) {
  width: 100% !important;
  height: 100% !important;
}

.add-word-panel {
  margin-left: 0;
  margin-right: 0;
}

/* 平板设备 (iPad Pro 等) */
@media (min-width: 768px) and (max-width: 1200px) {
  .content-container {
    padding: 12px;
    max-width: 700px;
  }

  .stats-card {
    padding: 14px;
    margin-bottom: 16px;
  }

  .stats-value {
    font-size: 24px;
  }

  .stats-label {
    font-size: 13px;
  }

  .section-title {
    font-size: 14px;
    margin: 0 0 8px 4px;
  }

  .batch-card {
    padding: 14px;
  }

  .batch-text h3 {
    font-size: 15px;
  }

  .batch-text p {
    font-size: 12px;
  }

  .form-actions {
    margin-top: 16px;
    padding: 0 12px;
  }

  :deep(.van-field__label) {
    font-size: 14px;
  }

  :deep(.van-field__control) {
    font-size: 14px;
  }

  :deep(.van-button--small) {
    font-size: 13px;
    padding: 0 10px;
    height: 28px;
  }
}

/* 手机设备 */
@media (max-width: 767px) {
  .content-container {
    padding: 12px;
  }

  .stats-card {
    padding: 14px;
    margin-bottom: 16px;
  }

  .stats-value {
    font-size: 24px;
  }

  .batch-card {
    padding: 14px;
  }
}
</style>
