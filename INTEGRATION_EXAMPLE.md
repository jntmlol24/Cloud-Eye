# 前后端集成示例

## 1. 在App.vue中集成API和WebSocket

### 1.1 修改App.vue的script部分

```typescript
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { monitorApi } from '@/api/monitor'
import { alertApi } from '@/api/alert'
import websocketManager from '@/utils/websocket-manager'

// 定义侧边栏菜单
const menuItems = [
  { index: 'dashboard', title: '仪表盘', icon: 'el-icon-s-home' },
  { index: 'server', title: '服务器监控', icon: 'el-icon-cpu' },
  { index: 'app', title: '应用性能', icon: 'el-icon-s-grid' },
  { index: 'log', title: '日志分析', icon: 'el-icon-document' },
  { index: 'alert', title: '告警管理', icon: 'el-icon-warning' },
  { index: 'report', title: '报表统计', icon: 'el-icon-data-analysis' },
  { index: 'config', title: '系统配置', icon: 'el-icon-setting' },
]

// 当前选中的菜单
const activeIndex = ref('dashboard')

// 服务器监控数据
const serverData = ref({
  cpu: 65,
  memory: 78,
  disk: 45,
  network: 32,
})

// 应用性能数据
const appData = ref([
  { name: '应用A', responseTime: 120, throughput: 1500, errorRate: 0.5 },
  { name: '应用B', responseTime: 80, throughput: 2300, errorRate: 0.2 },
  { name: '应用C', responseTime: 200, throughput: 800, errorRate: 1.2 },
  { name: '应用D', responseTime: 60, throughput: 3000, errorRate: 0.1 },
])

// 告警数据
const alertData = ref([
  { id: 1, level: 'error', message: '服务器CPU使用率超过90%', time: '2026-03-10 10:30:00' },
  { id: 2, level: 'warning', message: '应用响应时间过长', time: '2026-03-10 09:15:00' },
  { id: 3, level: 'info', message: '服务器重启成功', time: '2026-03-10 08:00:00' },
])

// 日志查询时间范围
const dateRange = ref<[Date, Date] | null>(null)

// 日志查询关键词
const searchKeyword = ref('')

// 日志级别选择
const logLevel = ref('')

// 初始化图表
const initCharts = () => {
  // CPU使用率图表
  const cpuChartElement = document.getElementById('cpuChart') as HTMLElement
  if (cpuChartElement) {
    const cpuChart = echarts.init(cpuChartElement)
    cpuChart.setOption({
      title: { text: 'CPU使用率' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: [45, 52, 65, 78, 62, 55],
          type: 'line',
          smooth: true,
        },
      ],
    })
  }

  // 内存使用率图表
  const memoryChartElement = document.getElementById('memoryChart') as HTMLElement
  if (memoryChartElement) {
    const memoryChart = echarts.init(memoryChartElement)
    memoryChart.setOption({
      title: { text: '内存使用率' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: [60, 65, 72, 78, 75, 70],
          type: 'line',
          smooth: true,
        },
      ],
    })
  }

  // 应用性能图表
  const appChartElement = document.getElementById('appChart') as HTMLElement
  if (appChartElement) {
    const appChart = echarts.init(appChartElement)
    appChart.setOption({
      title: { text: '应用响应时间' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: appData.value.map((item) => item.name),
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: appData.value.map((item) => item.responseTime),
          type: 'bar',
        },
      ],
    })
  }
}

// WebSocket消息处理
const handleServerStats = (message: any) => {
  if (message.data.serverId === 1) {
    serverData.value = {
      cpu: message.data.cpu,
      memory: message.data.memory,
      disk: message.data.disk,
      network: message.data.network,
    }
  }
}

const handleAlert = (message: any) => {
  alertData.value.unshift({
    id: message.data.id,
    level: message.data.level,
    message: message.data.message,
    time: message.data.time,
  })

  if (alertData.value.length > 10) {
    alertData.value.pop()
  }
}

// API调用示例
const fetchServerStats = async () => {
  try {
    const stats = await monitorApi.getServerStats(1)
    serverData.value = stats
  } catch (error) {
    console.error('获取服务器状态失败:', error)
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

// 生命周期钩子
onMounted(() => {
  // 初始化WebSocket连接
  websocketManager.init()

  // 注册WebSocket消息处理器
  const monitorWs = websocketManager.getMonitorWs()
  if (monitorWs) {
    monitorWs.on('serverStats', handleServerStats)
  }

  const alertWs = websocketManager.getAlertWs()
  if (alertWs) {
    alertWs.on('alert', handleAlert)
  }

  // 初始化图表
  nextTick(() => {
    initCharts()
  })

  // 初始数据加载
  fetchServerStats()
  fetchAlertList()
})

onUnmounted(() => {
  // 清理WebSocket连接
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

// 监听窗口大小变化，重新调整图表大小
window.addEventListener('resize', () => {
  const cpuChartElement = document.getElementById('cpuChart') as HTMLElement
  const memoryChartElement = document.getElementById('memoryChart') as HTMLElement
  const appChartElement = document.getElementById('appChart') as HTMLElement

  if (cpuChartElement) {
    const cpuChart = echarts.getInstanceByDom(cpuChartElement)
    cpuChart?.resize()
  }

  if (memoryChartElement) {
    const memoryChart = echarts.getInstanceByDom(memoryChartElement)
    memoryChart?.resize()
  }

  if (appChartElement) {
    const appChart = echarts.getInstanceByDom(appChartElement)
    appChart?.resize()
  }
})
</script>
```

## 2. 安装必要的依赖

```bash
npm install axios
npm install @types/axios -D
```

## 3. 项目结构

```
src/
├── api/                    # API接口定义
│   ├── user.ts            # 用户相关API
│   ├── monitor.ts         # 监控相关API
│   ├── alert.ts           # 告警相关API
│   └── log.ts            # 日志相关API
├── utils/                 # 工具函数
│   ├── request.ts         # HTTP请求封装
│   ├── websocket.ts       # WebSocket服务
│   └── websocket-manager.ts  # WebSocket管理器
├── views/                 # 页面组件
│   ├── Login.vue          # 登录页面
│   └── Dashboard.vue     # 仪表盘页面
├── stores/                # 状态管理
│   └── user.ts           # 用户状态
├── router/                # 路由配置
│   ├── index.ts          # 路由定义
│   └── guard.ts          # 路由守卫
└── App.vue               # 根组件
```

## 4. 完整的工作流程

### 4.1 登录流程

1. 用户在登录页面输入用户名和密码
2. 调用 `userApi.login()` 发送登录请求
3. 后端验证成功后返回JWT token
4. 前端将token存储到localStorage
5. 跳转到主页面

### 4.2 API请求流程

1. 组件中调用对应的API方法
2. request拦截器自动添加Authorization header
3. 发送HTTP请求到后端
4. response拦截器处理响应数据
5. 组件接收处理后的数据

### 4.3 WebSocket连接流程

1. 页面加载时初始化WebSocket连接
2. 建立连接后注册消息处理器
3. 接收到实时数据后更新页面状态
4. 页面卸载时清理连接和处理器

## 5. 调试技巧

### 5.1 查看网络请求

打开浏览器开发者工具 -> Network标签页，可以看到所有的HTTP请求。

### 5.2 查看WebSocket连接

打开浏览器开发者工具 -> Network标签页 -> WS筛选，可以看到WebSocket连接和消息。

### 5.3 查看控制台日志

打开浏览器开发者工具 -> Console标签页，可以看到所有的日志输出。

## 6. 常见问题解决

### 6.1 CORS跨域问题

如果遇到CORS错误，检查：
- 后端是否配置了CORS
- 前端代理配置是否正确
- 请求的URL是否正确

### 6.2 WebSocket连接失败

如果WebSocket连接失败，检查：
- 后端WebSocket服务是否启动
- WebSocket URL是否正确
- Token是否有效
- 防火墙是否阻止了连接

### 6.3 Token过期

如果Token过期，会自动跳转到登录页面，需要重新登录。

## 7. 性能优化建议

### 7.1 请求缓存

对于不经常变化的数据，可以添加缓存机制。

### 7.2 防抖节流

对于频繁触发的操作，使用防抖节流优化。

### 7.3 懒加载

对于大型组件，使用路由懒加载。

## 8. 安全建议

### 8.1 HTTPS

生产环境使用HTTPS协议。

### 8.2 Token安全

- 不要在URL中传递token
- 设置合理的token过期时间
- 定期刷新token

### 8.3 输入验证

对所有用户输入进行验证，防止XSS攻击。

## 9. 部署建议

### 9.1 前端部署

- 使用Vite构建生产版本
- 配置CDN加速
- 启用Gzip压缩

### 9.2 后端部署

- 使用Docker容器化
- 配置负载均衡
- 设置监控告警

## 10. 总结

通过以上方案，实现了前后端的完整连接：

1. **HTTP API**: 使用axios进行RESTful API调用
2. **WebSocket**: 实现实时数据推送
3. **状态管理**: 使用Pinia管理全局状态
4. **路由守卫**: 实现权限控制
5. **环境配置**: 支持多环境部署

这种架构具有良好的可扩展性和可维护性，适合企业级应用开发。