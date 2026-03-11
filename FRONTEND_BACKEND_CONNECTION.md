# CloudEye 前后端连接方案

## 1. 连接架构概述

```
前端 (Vue3)
    ↓ HTTP API
后端网关
    ↓
微服务层
    ↓ WebSocket
前端 (Vue3)
```

## 2. HTTP API 连接方案

### 2.1 安装依赖

```bash
npm install axios
npm install @types/axios -D
```

### 2.2 创建API配置文件

创建 `src/utils/request.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, data, message } = response.data
    
    if (code === 200) {
      return data
    } else if (code === 401) {
      ElMessage.error('未授权，请重新登录')
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(new Error(message || '未授权'))
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error: any) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('禁止访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error('网络错误')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service
```

### 2.3 创建API服务模块

创建 `src/api/user.ts`:

```typescript
import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  roles: string[]
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export const userApi = {
  login: (params: LoginParams) => 
    request.post<LoginResponse>('/user/login', params),
  
  getUserInfo: () => 
    request.get<UserInfo>('/user/info'),
  
  logout: () => 
    request.post('/user/logout')
}
```

创建 `src/api/monitor.ts`:

```typescript
import request from '@/utils/request'

export interface ServerInfo {
  id: number
  name: string
  ip: string
  port: number
  username: string
  status: string
}

export interface ServerStats {
  cpu: number
  memory: number
  disk: number
  network: number
}

export interface AppInfo {
  id: number
  name: string
  url: string
  status: string
}

export interface AppStats {
  responseTime: number
  throughput: number
  errorRate: number
}

export const monitorApi = {
  getServerList: (params: { page: number; size: number }) => 
    request.get('/monitor/server/list', { params }),
  
  addServer: (params: Partial<ServerInfo>) => 
    request.post('/monitor/server/add', params),
  
  updateServer: (params: ServerInfo) => 
    request.put('/monitor/server/update', params),
  
  deleteServer: (id: number) => 
    request.delete(`/monitor/server/delete?id=${id}`),
  
  getServerStats: (id: number) => 
    request.get<ServerStats>(`/monitor/server/stats?id=${id}`),
  
  getAppList: (params: { page: number; size: number }) => 
    request.get('/monitor/app/list', { params }),
  
  getAppStats: (id: number) => 
    request.get<AppStats>(`/monitor/app/stats?id=${id}`)
}
```

创建 `src/api/alert.ts`:

```typescript
import request from '@/utils/request'

export interface AlertRule {
  id?: number
  name: string
  condition: string
  level: string
  status: string
}

export interface Alert {
  id: number
  level: string
  message: string
  serverId?: number
  appId?: number
  status: string
  time: string
}

export const alertApi = {
  getRuleList: (params: { page: number; size: number }) => 
    request.get('/alert/rule/list', { params }),
  
  addRule: (params: AlertRule) => 
    request.post('/alert/rule/add', params),
  
  updateRule: (params: AlertRule) => 
    request.put('/alert/rule/update', params),
  
  deleteRule: (id: number) => 
    request.delete(`/alert/rule/delete?id=${id}`),
  
  getAlertList: (params: { page: number; size: number; level?: string; timeRange?: string }) => 
    request.get('/alert/list', { params }),
  
  handleAlert: (params: { id: number; status: string; remark?: string }) => 
    request.post('/alert/handle', params)
}
```

创建 `src/api/log.ts`:

```typescript
import request from '@/utils/request'

export interface LogSearchParams {
  timeRange?: [string, string]
  level?: string
  keyword?: string
  source?: string
}

export interface LogInfo {
  id: number
  time: string
  level: string
  message: string
  source: string
  detail?: string
}

export const logApi = {
  searchLogs: (params: LogSearchParams) => 
    request.post('/log/search', params),
  
  exportLogs: (params: LogSearchParams) => 
    request.post('/log/export', params),
  
  analyzeLogs: (params: { timeRange: [string, string]; source?: string }) => 
    request.post('/log/analyze', params)
}
```

### 2.4 在组件中使用API

在 `App.vue` 中使用API的示例：

```typescript
import { ref, onMounted } from 'vue'
import { monitorApi } from '@/api/monitor'
import { alertApi } from '@/api/alert'

const serverData = ref({
  cpu: 65,
  memory: 78,
  disk: 45,
  network: 32
})

const serverList = ref([])
const alertData = ref([])

const fetchServerStats = async () => {
  try {
    const stats = await monitorApi.getServerStats(1)
    serverData.value = stats
  } catch (error) {
    console.error('获取服务器状态失败:', error)
  }
}

const fetchServerList = async () => {
  try {
    const result = await monitorApi.getServerList({ page: 1, size: 10 })
    serverList.value = result.list
  } catch (error) {
    console.error('获取服务器列表失败:', error)
  }
}

const fetchAlertList = async () => {
  try {
    const result = await alertApi.getAlertList({ page: 1, size: 10 })
    alertData.value = result.list
  } catch (error) {
    console.error('获取告警列表失败:', error)
  }
}

onMounted(() => {
  fetchServerStats()
  fetchServerList()
  fetchAlertList()
})
```

## 3. WebSocket 连接方案

### 3.1 创建WebSocket服务

创建 `src/utils/websocket.ts`:

```typescript
import { ElMessage } from 'element-plus'

export type WebSocketMessageType = 'serverStats' | 'alert' | 'log'

export interface WebSocketMessage {
  type: WebSocketMessageType
  data: any
}

export type WebSocketMessageHandler = (message: WebSocketMessage) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private messageHandlers: Map<WebSocketMessageType, Set<WebSocketMessageHandler>> = new Map()
  private isManualClose = false

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已经连接')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const wsUrl = `${this.url}?token=${token}`
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket连接成功')
        this.reconnectAttempts = 0
        this.isManualClose = false
      }

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }

      this.ws.onerror = (error: Event) => {
        console.error('WebSocket错误:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接关闭')
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.reconnect()
    }
  }

  private reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    console.log(`尝试重新连接WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  disconnect(): void {
    this.isManualClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket未连接，无法发送消息')
    }
  }

  on(type: WebSocketMessageType, handler: WebSocketMessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    this.messageHandlers.get(type)!.add(handler)
  }

  off(type: WebSocketMessageType, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.messageHandlers.delete(type)
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('处理WebSocket消息失败:', error)
        }
      })
    }
  }
}

export default WebSocketService
```

### 3.2 创建WebSocket管理器

创建 `src/utils/websocket-manager.ts`:

```typescript
import WebSocketService, { WebSocketMessage, WebSocketMessageHandler } from './websocket'

class WebSocketManager {
  private monitorWs: WebSocketService | null = null
  private alertWs: WebSocketService | null = null

  init(): void {
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
    
    this.monitorWs = new WebSocketService(`${wsBaseUrl}/ws/monitor`)
    this.alertWs = new WebSocketService(`${wsBaseUrl}/ws/alert`)
    
    this.monitorWs.connect()
    this.alertWs.connect()
  }

  getMonitorWs(): WebSocketService | null {
    return this.monitorWs
  }

  getAlertWs(): WebSocketService | null {
    return this.alertWs
  }

  destroy(): void {
    this.monitorWs?.disconnect()
    this.alertWs?.disconnect()
    this.monitorWs = null
    this.alertWs = null
  }
}

export default new WebSocketManager()
```

### 3.3 在组件中使用WebSocket

在 `App.vue` 中使用WebSocket的示例：

```typescript
import { onMounted, onUnmounted } from 'vue'
import websocketManager from '@/utils/websocket-manager'

const serverData = ref({
  cpu: 65,
  memory: 78,
  disk: 45,
  network: 32
})

const alertData = ref([])

const handleServerStats = (message: WebSocketMessage) => {
  if (message.data.serverId === 1) {
    serverData.value = {
      cpu: message.data.cpu,
      memory: message.data.memory,
      disk: message.data.disk,
      network: message.data.network
    }
  }
}

const handleAlert = (message: WebSocketMessage) => {
  alertData.value.unshift({
    id: message.data.id,
    level: message.data.level,
    message: message.data.message,
    time: message.data.time
  })
  
  if (alertData.value.length > 10) {
    alertData.value.pop()
  }
}

onMounted(() => {
  websocketManager.init()
  
  const monitorWs = websocketManager.getMonitorWs()
  if (monitorWs) {
    monitorWs.on('serverStats', handleServerStats)
  }
  
  const alertWs = websocketManager.getAlertWs()
  if (alertWs) {
    alertWs.on('alert', handleAlert)
  }
})

onUnmounted(() => {
  const monitorWs = websocketManager.getMonitorWs()
  if (monitorWs) {
    monitorWs.off('serverStats', handleServerStats)
  }
  
  const alertWs = websocketManager.getAlertWs()
  if (alertWs) {
    alertWs.off('alert', handleAlert)
  }
  
  websocketManager.destroy()
})
```

## 4. 环境配置

### 4.1 创建环境变量文件

创建 `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080
```

创建 `.env.production`:

```env
VITE_API_BASE_URL=https://api.cloudeye.com/api
VITE_WS_BASE_URL=wss://api.cloudeye.com
```

### 4.2 更新vite配置

更新 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
```

## 5. 状态管理集成

### 5.1 创建Pinia Store

创建 `src/stores/user.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi, type LoginParams, type UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const login = async (params: LoginParams) => {
    const response = await userApi.login(params)
    token.value = response.token
    userInfo.value = response.user
    localStorage.setItem('token', response.token)
  }

  const logout = async () => {
    await userApi.logout()
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const getUserInfo = async () => {
    const info = await userApi.getUserInfo()
    userInfo.value = info
  }

  return {
    token,
    userInfo,
    login,
    logout,
    getUserInfo
  }
})
```

## 6. 路由守卫集成

创建 `src/router/guard.ts`:

```typescript
import router from './index'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      ElMessage.warning('请先登录')
      next('/login')
    }
  }
})
```

## 7. 完整示例：登录流程

创建 `src/views/Login.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { LoginParams } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref<LoginParams>({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    await userStore.login(loginForm.value)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>CloudEye 智能运维监控平台</h2>
        </div>
      </template>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-header {
  text-align: center;
}

.login-header h2 {
  margin: 0;
  color: #409eff;
}
</style>
```

## 8. 最佳实践

### 8.1 错误处理
- 统一的错误处理机制
- 友好的错误提示
- 自动重试机制

### 8.2 性能优化
- 请求缓存
- 防抖节流
- 懒加载

### 8.3 安全性
- HTTPS加密传输
- Token过期处理
- XSS防护

### 8.4 可维护性
- 模块化设计
- 类型定义完善
- 代码注释清晰

## 9. 调试技巧

### 9.1 使用Vue DevTools
- 查看组件状态
- 监控API请求
- 调试WebSocket连接

### 9.2 使用浏览器开发者工具
- Network面板查看HTTP请求
- Console面板查看日志
- Application面板查看存储

### 9.3 使用Postman测试API
- 测试接口功能
- 验证数据格式
- 调试接口问题

## 10. 总结

通过以上方案，可以实现前后端的完整连接：

1. **HTTP API**: 使用axios进行RESTful API调用
2. **WebSocket**: 实现实时数据推送
3. **状态管理**: 使用Pinia管理全局状态
4. **路由守卫**: 实现权限控制
5. **环境配置**: 支持多环境部署

这种架构具有良好的可扩展性和可维护性，适合企业级应用开发。