<template>
  <div class="translate-app">
    <!-- Floating Layout Toggle Button -->
    <div class="layout-toolbar">
      <Button
        @click="toggleLayout"
        :icon="
          layoutMode === 'flex' ? 'pi pi-objects-column' : 'pi pi-th-large'
        "
        severity="secondary"
        rounded
        variant="text"
        :title="
          layoutMode === 'flex'
            ? 'Switch to stacked layout'
            : 'Switch to side-by-side layout'
        "
        class="floating-layout-btn"
      />
    </div>

    <AppHeader />

    <div class="main-content">
      <SettingsPanel
        v-model:lm-studio-url="lmStudioUrl"
        v-model:source-lang="sourceLang"
        v-model:target-lang="targetLang"
        v-model:selected-model="selectedModel"
        :available-models="availableModels"
        :is-loading-models="isLoadingModels"
        @swap-languages="swapLanguages"
        @refresh-models="loadAvailableModels"
      />

      <TranslationPanel
        v-model:source-text="sourceText"
        v-model:enable-streaming="enableStreaming"
        :translated-text="translatedText"
        :translated-markdown-html="translatedMarkdownHtml"
        :is-translating="isTranslating"
        :error="error"
        :layout-mode="layoutMode"
        @clear-input="clearInput"
        @translate-text="translateText"
        @copy-translation="copyTranslation"
        @source-text-change="onSourceTextChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import SettingsPanel from "./SettingsPanel.vue";
import TranslationPanel from "./TranslationPanel.vue";
import Button from "primevue/button";
import { useTranslation } from "../composables/useTranslation";

// Use the translation composable
const {
  lmStudioUrl,
  sourceLang,
  targetLang,
  sourceText,
  translatedText,
  enableStreaming,
  isTranslating,
  error,
  layoutMode,
  availableModels,
  selectedModel,
  isLoadingModels,
  translatedMarkdownHtml,
  swapLanguages,
  clearInput,
  onSourceTextChange,
  translateText,
  copyTranslation,
  toggleLayout,
  loadAvailableModels,
} = useTranslation();
</script>

<style lang="scss" scoped>
// Variables
$max-width: 1200px;
$primary-padding: 20px;

// Main container
.translate-app {
  max-width: $max-width;
  margin: 0 auto;
  padding: $primary-padding;
}

// Main content
.main-content {
  display: flex;
  flex-direction: column;
  gap: $primary-padding;
}

.layout-toolbar {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

// Floating layout toggle button
.floating-layout-btn {
  transition: all 0.3s ease;

  &:hover {
    color: var(--p-primary-color) !important;
    // transform: translateY(-1px);
    // box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: transparent !important;
  }

  &:active {
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 768px) {
  .translate-app {
    padding: 15px;
  }

  .floating-layout-btn {
    top: 15px;
    right: 15px;
    width: 44px;
    height: 44px;
    min-width: 44px;
  }
}

@media (max-width: 480px) {
  .translate-app {
    padding: 10px;
  }

  .floating-layout-btn {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
}
</style>
