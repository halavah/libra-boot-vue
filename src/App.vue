<template>
  <router-view />
</template>

<script setup>
</script>

<style lang="scss">
/* 根组件样式 */
#app {
  /* 字体 */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  /* 字体平滑 */
  -webkit-font-smoothing: antialiased;
  /* 字体平滑 */
  -moz-osx-font-smoothing: grayscale;
  /* 颜色 */
  color: #2c3e50;
}

/* 底部导航栏样式 */
#stagewise-container {
  /* 固定定位 */
  position: fixed;
  /* 底部 */
  bottom: 0;
  /* 左侧 */
  left: 0;
  /* 宽度 */
  width: 100%;
  z-index: 9999;
}
</style>
