<template>
  <div class="header-card">
    <Card>
      <template #content>
        <div class="header-content">
          <h1 class="header-title">
            <i class="pi pi-globe header-icon"></i>AI Translator
          </h1>
          <p class="header-subtitle">
            Translate text with markdown support using LM Studio
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";
</script>

<style lang="scss" scoped>
// Variables
$small-gap: 0.5rem;
$large-gap: 2rem;
$font-size-xl: 2.5rem;
$font-size-md: 1.1rem;

.header {
  &-card {
    margin-bottom: $large-gap;
  }

  &-content {
    text-align: center;
  }

  &-title {
    font-size: $font-size-xl;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: $small-gap;
    margin-top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-icon {
    margin-right: $small-gap;
  }

  &-subtitle {
    color: var(--p-text-muted-color);
    margin: 0;
    font-size: $font-size-md;
  }
}

// Responsive design
@media (max-width: 768px) {
  .header-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header {
    &-title {
      font-size: 1.75rem;
    }

    &-subtitle {
      font-size: 1rem;
    }
  }
}
</style>
