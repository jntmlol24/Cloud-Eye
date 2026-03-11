<!--
 * 登录页面组件
 * 提供用户登录功能
-->

<script setup lang="ts">
/**
 * 引入ref函数，用于创建响应式变量
 */
import { ref } from 'vue'
/**
 * 引入useRouter，用于路由跳转
 */
import { useRouter } from 'vue-router'
/**
 * 引入Element Plus的消息组件
 */
import { ElMessage } from 'element-plus'
/**
 * 引入用户API和登录参数类型
 */
import { userApi, type LoginParams } from '@/api/user'

/**
 * 路由实例
 */
const router = useRouter()

/**
 * 登录表单数据
 */
const loginForm = ref<LoginParams>({
  username: '',
  password: '',
})

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 验证用户名和密码是否为空
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  // 设置加载状态
  loading.value = true
  try {
    // 调用登录API
    const response = await userApi.login(loginForm.value)
    // 保存token到localStorage
    localStorage.setItem('token', response.data.token)
    // 显示登录成功消息
    ElMessage.success('登录成功')
    // 跳转到首页
    router.push('/')
  } catch (error) {
    // 显示登录失败消息
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    // 重置加载状态
    loading.value = false
  }
}
</script>

<template>
  <!-- 登录容器 -->
  <div class="login-container">
    <!-- 登录卡片 -->
    <el-card class="login-card">
      <!-- 卡片头部 -->
      <template #header>
        <div class="login-header">
          <h2>CloudEye 智能运维监控平台</h2>
        </div>
      </template>
      <!-- 登录表单 -->
      <el-form :model="loginForm" label-width="80px">
        <!-- 用户名输入 -->
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <!-- 密码输入 -->
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
/**
 * 登录容器样式
 * 居中显示，设置背景渐变
 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/**
 * 登录卡片样式
 * 设置宽度
 */
.login-card {
  width: 400px;
}

/**
 * 登录头部样式
 * 居中显示
 */
.login-header {
  text-align: center;
}

/**
 * 登录头部标题样式
 * 移除默认边距，设置颜色
 */
.login-header h2 {
  margin: 0;
  color: #409eff;
}
</style>
