<template>
  <Card class="settings-card">
    <template #content>
      <div class="settings-grid">
        <div class="url-input-container">
          <label for="lm-studio-url" class="form-label">LM Studio URL</label>
          <InputText
            id="lm-studio-url"
            v-model="lmStudioUrl"
            class="url-input"
            placeholder="http://localhost:1234"
          />
        </div>

        <div class="model-selector-container">
          <label for="model-select" class="form-label">Model</label>
          <Select
            id="model-select"
            v-model="selectedModel"
            :options="modelOptions"
            optionLabel="label"
            optionValue="value"
            :loading="isLoadingModels"
            :disabled="isLoadingModels || availableModels.length === 0"
            class="model-select"
            placeholder="Select a model..."
          />
          <div class="model-actions">
            <Button
              @click="refreshModels"
              size="small"
              severity="secondary"
              outlined
              icon="pi pi-refresh"
              :loading="isLoadingModels"
              label="Refresh"
            />
          </div>
        </div>
      </div>

      <div class="language-selector">
        <div class="language-input">
          <label for="source-lang" class="form-label">From Language</label>
          <Select
            id="source-lang"
            v-model="sourceLang"
            :options="languageOptions"
            optionLabel="label"
            optionValue="value"
            class="language-select"
          />
        </div>

        <div class="swap-container">
          <Button
            @click="swapLanguages"
            severity="secondary"
            outlined
            rounded
            icon="pi pi-arrow-right-arrow-left"
            :disabled="sourceLang === 'auto'"
            v-tooltip="'Swap languages'"
            class="swap-button"
          />
        </div>

        <div class="language-input">
          <label for="target-lang" class="form-label">To Language</label>
          <Select
            id="target-lang"
            v-model="targetLang"
            :options="targetLanguageOptions"
            optionLabel="label"
            optionValue="value"
            class="language-select"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";

// Props
const props = defineProps<{
  lmStudioUrl: string;
  sourceLang: string;
  targetLang: string;
  availableModels: string[];
  selectedModel: string;
  isLoadingModels: boolean;
}>();

// Emits
const emit = defineEmits<{
  "update:lmStudioUrl": [value: string];
  "update:sourceLang": [value: string];
  "update:targetLang": [value: string];
  "update:selectedModel": [value: string];
  swapLanguages: [];
  refreshModels: [];
}>();

// Language options
const languageOptions = [
  { label: "Auto-detect", value: "auto" },
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
];

const targetLanguageOptions = computed(() =>
  languageOptions.filter((lang) => lang.value !== "auto")
);

// Model options for Select component
const modelOptions = computed(() =>
  props.availableModels.map((model) => ({
    label: model,
    value: model,
  }))
);

// Computed v-model handlers
const lmStudioUrl = computed({
  get: () => props.lmStudioUrl,
  set: (value) => emit("update:lmStudioUrl", value),
});

const sourceLang = computed({
  get: () => props.sourceLang,
  set: (value) => emit("update:sourceLang", value),
});

const targetLang = computed({
  get: () => props.targetLang,
  set: (value) => emit("update:targetLang", value),
});

const selectedModel = computed({
  get: () => props.selectedModel,
  set: (value) => emit("update:selectedModel", value),
});

// Methods
const swapLanguages = () => {
  emit("swapLanguages");
};

const refreshModels = () => {
  emit("refreshModels");
};
</script>

<style lang="scss" scoped>
// Variables
$medium-gap: 1rem;
$small-gap: 0.5rem;
$font-size-sm: 0.875rem;

// Mixins
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin full-width {
  width: 100%;
}

// Form styling
.form-label {
  display: block;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 0.5rem;
  font-size: $font-size-sm;
}

// Settings section
.settings {
  &-card {
    margin-bottom: $medium-gap;
  }

  &-grid {
    display: flex;
    flex-direction: column;
    gap: $medium-gap;
  }
}

// URL input section
.url-input {
  @include full-width;

  &-container {
    @include full-width;
  }
}

// Model selector section
.model-selector-container {
  @include full-width;
  position: relative;
}

.model-select {
  @include full-width;
}

.model-actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

// Language selector
.language {
  &-selector {
    display: flex;
    align-items: start;
    gap: $medium-gap;
    margin-top: $medium-gap;
  }

  &-input {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &-select {
    @include full-width;
  }
}

.swap {
  &-container {
    @include flex-center;
    margin-top: 1.5rem; // Align with form fields below labels
  }

  &-button {
    min-width: 2.5rem;
  }
}

// Responsive design
@media (max-width: 768px) {
  .language-selector {
    flex-direction: column;
    align-items: stretch;
    gap: $medium-gap;
  }

  .swap-container {
    order: 3;
    margin: $small-gap 0;
    margin-top: 0; // Reset margin for mobile
  }
}
</style>
