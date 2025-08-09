<template>
  <div class="panels-grid" :class="{ 'layout-block': layoutMode === 'block' }">
    <div class="panel-column">
      <Card class="panel-card">
        <template #title>
          <div class="panel-header">
            <div class="panel-title">
              <i class="pi pi-file-edit panel-icon"></i>
              Source Text
            </div>
            <div class="panel-controls">
              <div class="checkbox-group">
                <Checkbox
                  v-model="enableStreaming"
                  :binary="true"
                  inputId="streaming"
                />
                <label for="streaming" class="checkbox-label">Stream</label>
              </div>
              <div class="checkbox-group">
                <Checkbox
                  v-model="enableAutoTranslate"
                  :binary="true"
                  inputId="auto-translate"
                />
                <label for="auto-translate" class="checkbox-label">Auto</label>
              </div>
              <Button
                @click="clearInput"
                size="small"
                severity="danger"
                outlined
                icon="pi pi-trash"
                label="Clear"
              />
            </div>
          </div>
        </template>
        <template #content>
          <Textarea
            v-model="sourceText"
            placeholder="Enter text to translate..."
            rows="10"
            class="full-width-textarea"
            @input="onSourceTextChange"
          />
        </template>
      </Card>
    </div>

    <div class="panel-column">
      <Card class="panel-card">
        <template #title>
          <div class="panel-header">
            <div class="panel-title">
              <i class="pi pi-language panel-icon"></i>
              Translation
            </div>
            <div class="action-buttons">
              <Button
                @click="translateText"
                :disabled="isTranslating || !sourceText.trim()"
                :loading="isTranslating"
                icon="pi pi-send"
                :label="
                  isTranslating
                    ? enableStreaming
                      ? 'Streaming...'
                      : 'Translating...'
                    : 'Translate'
                "
              />
              <Button
                @click="copyTranslation"
                :disabled="!translatedText"
                severity="secondary"
                outlined
                icon="pi pi-copy"
                label="Copy"
              />
            </div>
          </div>
        </template>
        <template #content>
          <Message
            v-if="error"
            severity="error"
            :closable="false"
            class="error-message"
          >
            {{ error }}
          </Message>
          <div class="preview-section">
            <div class="markdown-preview">
              <div v-html="translatedMarkdownHtml" v-if="translatedText"></div>
              <div v-else>Translation will appear here...</div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Textarea from "primevue/textarea";
import Message from "primevue/message";

// Props
const props = defineProps<{
  sourceText: string;
  translatedText: string;
  translatedMarkdownHtml: string;
  enableStreaming: boolean;
  enableAutoTranslate: boolean;
  isTranslating: boolean;
  error: string;
  layoutMode: "flex" | "block";
}>();

// Emits
const emit = defineEmits<{
  "update:sourceText": [value: string];
  "update:enableStreaming": [value: boolean];
  "update:enableAutoTranslate": [value: boolean];
  clearInput: [];
  translateText: [];
  copyTranslation: [];
  sourceTextChange: [];
}>();

// Computed v-model handlers
const sourceText = computed({
  get: () => props.sourceText,
  set: (value) => emit("update:sourceText", value),
});

const enableStreaming = computed({
  get: () => props.enableStreaming,
  set: (value) => emit("update:enableStreaming", value),
});

const enableAutoTranslate = computed({
  get: () => props.enableAutoTranslate,
  set: (value) => emit("update:enableAutoTranslate", value),
});

// Methods
const clearInput = () => {
  emit("clearInput");
};

const translateText = () => {
  emit("translateText");
};

const copyTranslation = () => {
  emit("copyTranslation");
};

const onSourceTextChange = () => {
  emit("sourceTextChange");
};
</script>

<style lang="scss" scoped>
// Variables
$grid-gap: 1.5rem;
$medium-gap: 1rem;
$small-gap: 0.5rem;
$font-size-sm: 0.875rem;
$border-radius: 6px;

// Mixins
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin full-width {
  width: 100%;
}

// Panels section
.panels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $grid-gap;

  &.layout-block {
    grid-template-columns: 1fr;

    .panel-column:first-child {
      margin-bottom: $grid-gap;
    }
  }
}

.panel {
  &-column {
    display: flex;
    flex-direction: column;
  }

  &-card {
    display: flex;
    flex-direction: column;
  }

  &-header {
    @include flex-between;
    flex-wrap: wrap;
    gap: $small-gap;
  }

  &-title {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  &-icon {
    margin-right: $small-gap;
    color: var(--p-primary-color);
  }

  &-controls {
    display: flex;
    gap: $medium-gap;
    flex-wrap: wrap;
    align-items: center;
  }
}

// Checkbox components
.checkbox {
  &-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &-label {
    font-size: $font-size-sm;
    margin-left: 0.3rem;
  }
}

// Action buttons
.action-buttons {
  display: flex;
  gap: $small-gap;
}

// Utility classes
.full-width-textarea {
  @include full-width;
}

.error-message {
  margin-bottom: 0.75rem;
}

.markdown-preview {
  padding: 6px 14px;
  border-radius: $border-radius;
  background: var(--p-surface-100);
  min-height: 300px;

  // Markdown content styling
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 0;
    margin-bottom: 0.5em;
    color: var(--p-text-color);
  }

  :deep(p) {
    margin: 0;
    line-height: 1.6;
  }

  :deep(code) {
    background: var(--p-surface-200);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: var(--p-surface-200);
    padding: 15px;
    border-radius: $border-radius;
    overflow-x: auto;
    margin-bottom: 1em;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    margin: 0 0 1em 0;
    padding: 0 0 0 15px;
    border-left: 4px solid var(--p-surface-300);
    color: var(--p-text-muted-color);
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1em;
    padding-left: 20px;
  }

  :deep(li) {
    margin-bottom: 0.5em;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
  }

  :deep(th),
  :deep(td) {
    padding: 8px 12px;
    border: 1px solid var(--p-surface-300);
    text-align: left;
  }

  :deep(th) {
    background: var(--p-surface-100);
    font-weight: 600;
  }

  :deep(a) {
    color: var(--p-primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .panels-grid {
    grid-template-columns: 1fr;
    gap: $medium-gap;

    &.layout-block .panel-column:first-child {
      margin-bottom: $medium-gap;
    }
  }

  .panel {
    &-header {
      flex-direction: column;
      align-items: stretch;
      gap: $medium-gap;
    }

    &-controls {
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .checkbox-group {
    margin-bottom: $small-gap;
  }
}

@media (max-width: 480px) {
  .panel-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .checkbox-group {
    justify-content: center;
  }
}
</style>
