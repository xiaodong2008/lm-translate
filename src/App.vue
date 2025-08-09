<script setup lang="ts">
import TranslateApp from "./components/TranslateApp.vue";
</script>

<template>
  <TranslateApp />
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  padding: 20px 0;
}
</style>
