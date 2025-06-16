<script setup lang="ts">
import Dashboard from './views/Dashboard.vue';
</script>

<template>
  <v-app>
    <Dashboard />
  </v-app>
</template>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Manrope', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
