<template>
  <router-view />
  <!-- Stagewise toolbar will only be rendered in development mode -->
  <component
    v-if="isDevelopment && StagewiseComponent"
    :is="StagewiseComponent"
    :config="stagewiseConfig"
  />
</template>

<script setup>
import { ref, shallowRef } from "vue";

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === "development";

// Create stagewise config
const stagewiseConfig = ref({
  plugins: [],
});

// Use shallowRef for component to avoid deep reactivity
const StagewiseComponent = shallowRef(null);

// Only import StagewiseToolbar in development mode
if (isDevelopment) {
  import("@stagewise/toolbar-vue")
    .then((module) => {
      StagewiseComponent.value = module.StagewiseToolbar;
    })
    .catch((error) => {
      console.warn("Stagewise toolbar failed to load:", error);
    });
}
</script>

<style>
/* Minimal styles for the root App component */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif; /* Keep font stack or adjust */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50; /* Keep base color or adjust */
  /* Removed text-align: center and margin-top: 60px */
}

/* Stagewise container styles */
#stagewise-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}
</style>
