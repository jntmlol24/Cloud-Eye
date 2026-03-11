<!--
 * 应用根组件
 * 作为路由的容器，显示当前路由对应的组件
-->

<script setup lang="ts">
/**
 * 引入RouterView组件
 * 用于显示当前路由对应的组件内容
 */
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- 路由视图容器 -->
  <RouterView />
</template>

<style>
/**
 * 全局样式重置
 * 确保在不同浏览器中具有一致的基础样式
 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/**
 * 全局字体和背景设置
 * 使用系统默认字体，确保良好的可读性
 */
body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}
</style>
