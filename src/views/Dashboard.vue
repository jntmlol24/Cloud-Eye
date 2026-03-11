<script setup lang="ts">
/**
 * 引入Vue的响应式API
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
/**
 * 引入ECharts图表库
 */
import * as echarts from 'echarts'
/**
 * 引入监控API
 */
import { monitorApi } from '@/api/monitor'
/**
 * 引入WebSocket管理器
 */
import websocketManager from '@/utils/websocket-manager'

/**
 * 侧边栏菜单项
 */
const menuItems = [
  { index: 'dashboard', title: '仪表盘', icon: 'el-icon-s-home' },
  { index: 'server', title: '服务器监控', icon: 'el-icon-cpu' },
  { index: 'app', title: '应用性能', icon: 'el-icon-s-grid' },
  { index: 'log', title: '日志分析', icon: 'el-icon-document' },
  { index: 'alert', title: '告警管理', icon: 'el-icon-warning' },
  { index: 'report', title: '报表统计', icon: 'el-icon-data-analysis' },
  { index: 'config', title: '系统配置', icon: 'el-icon-setting' },
]

/**
 * 当前选中的菜单项
 */
const activeIndex = ref('dashboard')

/**
 * 服务器监控数据
 */
const serverData = ref({
  cpu: 65, // CPU使用率
  memory: 78, // 内存使用率
  disk: 45, // 磁盘使用率
  network: 32, // 网络流量
})

/**
 * 应用性能数据
 */
const appData = ref([
  { name: '应用A', responseTime: 120, throughput: 1500, errorRate: 0.5 },
  { name: '应用B', responseTime: 80, throughput: 2300, errorRate: 0.2 },
  { name: '应用C', responseTime: 200, throughput: 800, errorRate: 1.2 },
  { name: '应用D', responseTime: 60, throughput: 3000, errorRate: 0.1 },
])

/**
 * 告警数据
 */
const alertData = ref([
  { id: 1, level: 'error', message: '服务器CPU使用率超过90%', time: '2026-03-10 10:30:00' },
  { id: 2, level: 'warning', message: '应用响应时间过长', time: '2026-03-10 09:15:00' },
  { id: 3, level: 'info', message: '服务器重启成功', time: '2026-03-10 08:00:00' },
])

/**
 * 日志查询时间范围
 */
const dateRange = ref<[Date, Date] | null>(null)

/**
 * 日志查询关键词
 */
const searchKeyword = ref('')

/**
 * 日志级别选择
 */
const logLevel = ref('')

/**
 * 图表实例
 */
const cpuChart = ref<echarts.ECharts | null>(null) // CPU使用率图表
const memoryChart = ref<echarts.ECharts | null>(null) // 内存使用率图表
const appChart = ref<echarts.ECharts | null>(null) // 应用性能图表

/**
 * 加载状态
 */
const loading = ref({
  server: false, // 服务器数据加载状态
  alert: false, // 告警数据加载状态
})

/**
 * 初始化图表
 * 创建并配置CPU、内存和应用性能图表
 */
const initCharts = () => {
  // CPU使用率图表
  const cpuChartElement = document.getElementById('cpuChart') as HTMLElement
  if (cpuChartElement) {
    cpuChart.value = echarts.init(cpuChartElement)
    cpuChart.value.setOption({
      title: { text: 'CPU使用率', textStyle: { fontSize: 14, fontWeight: 'normal' } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
        splitLine: { lineStyle: { color: '#f0f2f5' } },
      },
      series: [
        {
          name: 'CPU使用率',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#409eff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
            ]),
          },
          data: [45, 52, 65, 78, 62, 55],
        },
      ],
    })
  }

  // 内存使用率图表
  const memoryChartElement = document.getElementById('memoryChart') as HTMLElement
  if (memoryChartElement) {
    memoryChart.value = echarts.init(memoryChartElement)
    memoryChart.value.setOption({
      title: { text: '内存使用率', textStyle: { fontSize: 14, fontWeight: 'normal' } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
        splitLine: { lineStyle: { color: '#f0f2f5' } },
      },
      series: [
        {
          name: '内存使用率',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#67c23a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
            ]),
          },
          data: [60, 65, 72, 78, 75, 70],
        },
      ],
    })
  }

  // 应用性能图表
  const appChartElement = document.getElementById('appChart') as HTMLElement
  if (appChartElement) {
    appChart.value = echarts.init(appChartElement)
    appChart.value.setOption({
      title: { text: '应用响应时间', textStyle: { fontSize: 14, fontWeight: 'normal' } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: appData.value.map((item) => item.name),
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e0e6ed' } },
        axisLabel: { color: '#606266' },
        splitLine: { lineStyle: { color: '#f0f2f5' } },
      },
      series: [
        {
          name: '响应时间(ms)',
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409eff' },
              { offset: 1, color: '#66b1ff' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: appData.value.map((item) => item.responseTime),
        },
      ],
    })
  }
}

/**
 * 处理WebSocket消息
 * @param message WebSocket消息
 */
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

/**
 * 模拟WebSocket连接
 * 定期更新服务器状态数据
 */
const connectWebSocket = () => {
  console.log('WebSocket连接已建立')
  setInterval(() => {
    serverData.value.cpu = Math.floor(Math.random() * 100)
    serverData.value.memory = Math.floor(Math.random() * 100)
    serverData.value.disk = Math.floor(Math.random() * 100)
    serverData.value.network = Math.floor(Math.random() * 100)
  }, 5000)
}

/**
 * 获取服务器状态
 * 调用API获取服务器状态数据
 */
const fetchServerStats = async () => {
  loading.value.server = true
  try {
    const stats = await monitorApi.getServerStats(1)
    serverData.value = stats.data
  } catch (error) {
    console.error('获取服务器状态失败:', error)
  } finally {
    loading.value.server = false
  }
}

/**
 * 生命周期钩子 - 组件挂载时
 * 初始化WebSocket连接，注册消息处理函数，初始化图表，获取服务器状态
 */
onMounted(() => {
  // 初始化WebSocket连接
  websocketManager.init()
  // 获取监控WebSocket连接
  const monitorWs = websocketManager.getMonitorWs()
  if (monitorWs) {
    // 注册服务器状态消息处理函数
    monitorWs.on('serverStats', handleServerStats)
  }
  // 等待DOM更新后初始化图表
  nextTick(() => {
    initCharts()
  })
  // 模拟WebSocket连接
  connectWebSocket()
  // 获取服务器状态
  fetchServerStats()
})

/**
 * 生命周期钩子 - 组件卸载时
 * 销毁WebSocket连接，销毁图表实例
 */
onUnmounted(() => {
  // 获取监控WebSocket连接
  const monitorWs = websocketManager.getMonitorWs()
  if (monitorWs) {
    // 取消注册服务器状态消息处理函数
    monitorWs.off('serverStats', handleServerStats)
  }
  // 销毁WebSocket连接
  websocketManager.destroy()
  // 销毁图表实例
  cpuChart.value?.dispose()
  memoryChart.value?.dispose()
  appChart.value?.dispose()
})

/**
 * 监听窗口大小变化
 * 调整图表大小
 */
window.addEventListener('resize', () => {
  cpuChart.value?.resize()
  memoryChart.value?.resize()
  appChart.value?.resize()
})

/**
 * 监听菜单变化
 * 当切换到应用性能页面时，调整图表大小
 */
watch(activeIndex, (newIndex) => {
  nextTick(() => {
    if (newIndex === 'app') {
      appChart.value?.resize()
    }
  })
})
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="logo">
        <el-icon class="logo-icon"
          ><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            ></path></svg
        ></el-icon>
        <span>CloudEye</span>
      </div>
      <div class="header-right">
        <div class="header-info">
          <el-badge :value="alertData.length" :max="99" class="notification-badge">
            <el-button link class="notification-btn">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small" :src="''" icon="el-icon-user" />
              <span>管理员</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Setting /></el-icon>
                  <span>系统设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="app-main">
      <!-- 侧边栏 -->
      <aside class="app-sidebar">
        <el-menu
          :default-active="activeIndex"
          class="sidebar-menu"
          @select="(key: string) => (activeIndex = key)"
          :style="{ backgroundColor: '#001529' }"
          :text-color="'#fff'"
          active-text-color="#409eff"
        >
          <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
            <template #icon>
              <i :class="item.icon"></i>
            </template>
            {{ item.title }}
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2>{{ menuItems.find((item) => item.index === activeIndex)?.title }}</h2>
          <div class="page-actions">
            <el-button v-if="activeIndex === 'server'" type="primary" plain size="small">
              <el-icon><Plus /></el-icon>
              添加服务器
            </el-button>
            <el-button v-if="activeIndex === 'alert'" type="primary" plain size="small">
              <el-icon><Plus /></el-icon>
              添加告警规则
            </el-button>
          </div>
        </div>

        <!-- 仪表盘页面 -->
        <div v-if="activeIndex === 'dashboard'" class="dashboard">
          <div class="card-container">
            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>服务器状态</span>
                  <el-button link size="small" @click="fetchServerStats">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </template>
              <el-skeleton :loading="loading.server" animated>
                <template #template>
                  <el-skeleton-item variant="h3" style="width: 80px" />
                  <el-skeleton-item variant="p" style="width: 100%" />
                  <el-skeleton-item variant="p" style="width: 100%" />
                </template>
                <div class="server-stats">
                  <div class="stat-item">
                    <div class="stat-header">
                      <span class="stat-label">CPU使用率</span>
                      <span
                        class="stat-value"
                        :class="{
                          'text-danger': serverData.cpu > 80,
                          'text-warning': serverData.cpu > 60 && serverData.cpu <= 80,
                          'text-success': serverData.cpu <= 60,
                        }"
                        >{{ serverData.cpu }}%</span
                      >
                    </div>
                    <el-progress
                      :percentage="serverData.cpu"
                      :color="
                        serverData.cpu > 80
                          ? '#F56C6C'
                          : serverData.cpu > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="8"
                      :show-text="false"
                    />
                  </div>
                  <div class="stat-item">
                    <div class="stat-header">
                      <span class="stat-label">内存使用率</span>
                      <span
                        class="stat-value"
                        :class="{
                          'text-danger': serverData.memory > 80,
                          'text-warning': serverData.memory > 60 && serverData.memory <= 80,
                          'text-success': serverData.memory <= 60,
                        }"
                        >{{ serverData.memory }}%</span
                      >
                    </div>
                    <el-progress
                      :percentage="serverData.memory"
                      :color="
                        serverData.memory > 80
                          ? '#F56C6C'
                          : serverData.memory > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="8"
                      :show-text="false"
                    />
                  </div>
                  <div class="stat-item">
                    <div class="stat-header">
                      <span class="stat-label">磁盘使用率</span>
                      <span
                        class="stat-value"
                        :class="{
                          'text-danger': serverData.disk > 80,
                          'text-warning': serverData.disk > 60 && serverData.disk <= 80,
                          'text-success': serverData.disk <= 60,
                        }"
                        >{{ serverData.disk }}%</span
                      >
                    </div>
                    <el-progress
                      :percentage="serverData.disk"
                      :color="
                        serverData.disk > 80
                          ? '#F56C6C'
                          : serverData.disk > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="8"
                      :show-text="false"
                    />
                  </div>
                  <div class="stat-item">
                    <div class="stat-header">
                      <span class="stat-label">网络流量</span>
                      <span class="stat-value">{{ serverData.network }}MB/s</span>
                    </div>
                    <el-progress
                      :percentage="serverData.network"
                      :color="
                        serverData.network > 80
                          ? '#F56C6C'
                          : serverData.network > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="8"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-skeleton>
            </el-card>

            <el-card class="info-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>最近告警</span>
                  <el-button link size="small"> 查看全部 </el-button>
                </div>
              </template>
              <el-table :data="alertData" style="width: 100%" size="small">
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="
                        scope.row.level === 'error'
                          ? 'danger'
                          : scope.row.level === 'warning'
                            ? 'warning'
                            : 'info'
                      "
                      size="small"
                    >
                      {{
                        scope.row.level === 'error'
                          ? '错误'
                          : scope.row.level === 'warning'
                            ? '警告'
                            : '信息'
                      }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="message" label="消息">
                  <template #default="scope">
                    <div class="alert-message">{{ scope.row.message }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="时间" width="160" />
              </el-table>
            </el-card>
          </div>

          <div class="chart-container">
            <el-card class="chart-card" shadow="hover">
              <div id="cpuChart" style="width: 100%; height: 300px"></div>
            </el-card>
            <el-card class="chart-card" shadow="hover">
              <div id="memoryChart" style="width: 100%; height: 300px"></div>
            </el-card>
          </div>
        </div>

        <!-- 服务器监控页面 -->
        <div v-else-if="activeIndex === 'server'" class="server-monitor">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>服务器列表</span>
                <el-button type="primary" size="small">
                  <el-icon><Plus /></el-icon>
                  添加服务器
                </el-button>
              </div>
            </template>
            <el-table
              :data="[
                {
                  id: 1,
                  name: '服务器1',
                  ip: '192.168.1.100',
                  cpu: '65%',
                  memory: '78%',
                  disk: '45%',
                  status: 'running',
                },
                {
                  id: 2,
                  name: '服务器2',
                  ip: '192.168.1.101',
                  cpu: '42%',
                  memory: '58%',
                  disk: '62%',
                  status: 'running',
                },
                {
                  id: 3,
                  name: '服务器3',
                  ip: '192.168.1.102',
                  cpu: '85%',
                  memory: '88%',
                  disk: '75%',
                  status: 'warning',
                },
              ]"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="服务器名称" />
              <el-table-column prop="ip" label="IP地址" />
              <el-table-column prop="cpu" label="CPU使用率" width="120">
                <template #default="scope">
                  <div class="progress-text">
                    <span>{{ scope.row.cpu }}</span>
                    <el-progress
                      :percentage="parseInt(scope.row.cpu)"
                      :color="
                        parseInt(scope.row.cpu) > 80
                          ? '#F56C6C'
                          : parseInt(scope.row.cpu) > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="4"
                      :show-text="false"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="memory" label="内存使用率" width="120">
                <template #default="scope">
                  <div class="progress-text">
                    <span>{{ scope.row.memory }}</span>
                    <el-progress
                      :percentage="parseInt(scope.row.memory)"
                      :color="
                        parseInt(scope.row.memory) > 80
                          ? '#F56C6C'
                          : parseInt(scope.row.memory) > 60
                            ? '#E6A23C'
                            : '#67C23A'
                      "
                      :stroke-width="4"
                      :show-text="false"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="disk" label="磁盘使用率" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'running' ? 'success' : 'warning'">
                    {{ scope.row.status === 'running' ? '运行中' : '警告' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default>
                  <el-button type="primary" size="small" plain>
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                  <el-button size="small" plain>
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" plain>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 应用性能页面 -->
        <div v-else-if="activeIndex === 'app'" class="app-performance">
          <div class="chart-container">
            <el-card class="chart-card" shadow="hover">
              <div id="appChart" style="width: 100%; height: 300px"></div>
            </el-card>
          </div>
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>应用列表</span>
              </div>
            </template>
            <el-table :data="appData" stripe style="width: 100%">
              <el-table-column prop="name" label="应用名称" />
              <el-table-column prop="responseTime" label="响应时间(ms)" width="120">
                <template #default="scope">
                  <span
                    :class="{
                      'text-danger': scope.row.responseTime > 200,
                      'text-warning': scope.row.responseTime > 100 && scope.row.responseTime <= 200,
                      'text-success': scope.row.responseTime <= 100,
                    }"
                    >{{ scope.row.responseTime }}ms</span
                  >
                </template>
              </el-table-column>
              <el-table-column prop="throughput" label="吞吐量(QPS)" width="120" />
              <el-table-column prop="errorRate" label="错误率(%)" width="120">
                <template #default="scope">
                  <span
                    :class="{
                      'text-danger': scope.row.errorRate > 1,
                      'text-warning': scope.row.errorRate > 0.5 && scope.row.errorRate <= 1,
                      'text-success': scope.row.errorRate <= 0.5,
                    }"
                    >{{ scope.row.errorRate }}%</span
                  >
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default>
                  <el-button type="primary" size="small" plain>
                    <el-icon><View /></el-icon>
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 日志分析页面 -->
        <div v-else-if="activeIndex === 'log'" class="log-analysis">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>日志查询</span>
              </div>
            </template>
            <el-form :inline="true" class="log-form" size="small">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 240px"
                />
              </el-form-item>
              <el-form-item label="日志级别">
                <el-select v-model="logLevel" placeholder="请选择日志级别" style="width: 120px">
                  <el-option label="INFO" value="info" />
                  <el-option label="WARN" value="warn" />
                  <el-option label="ERROR" value="error" />
                  <el-option label="DEBUG" value="debug" />
                </el-select>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="searchKeyword" placeholder="请输入关键词" style="width: 200px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
              </el-form-item>
            </el-form>
            <el-table
              :data="[
                {
                  id: 1,
                  time: '2026-03-10 10:30:00',
                  level: 'ERROR',
                  message: '数据库连接失败',
                  source: '应用A',
                },
                {
                  id: 2,
                  time: '2026-03-10 09:15:00',
                  level: 'WARN',
                  message: '缓存过期',
                  source: '应用B',
                },
                {
                  id: 3,
                  time: '2026-03-10 08:00:00',
                  level: 'INFO',
                  message: '应用启动成功',
                  source: '应用C',
                },
              ]"
              stripe
              style="width: 100%"
              size="small"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="level" label="级别" width="100">
                <template #default="scope">
                  <el-tag
                    :type="
                      scope.row.level === 'ERROR'
                        ? 'danger'
                        : scope.row.level === 'WARN'
                          ? 'warning'
                          : 'info'
                    "
                    size="small"
                  >
                    {{ scope.row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="消息" />
              <el-table-column prop="source" label="来源" width="120" />
            </el-table>
          </el-card>
        </div>

        <!-- 告警管理页面 -->
        <div v-else-if="activeIndex === 'alert'" class="alert-management">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>告警规则</span>
                <el-button type="primary" size="small">
                  <el-icon><Plus /></el-icon>
                  添加规则
                </el-button>
              </div>
            </template>
            <el-table
              :data="[
                {
                  id: 1,
                  name: 'CPU使用率告警',
                  condition: 'CPU使用率 > 90%',
                  level: 'error',
                  status: 'enabled',
                },
                {
                  id: 2,
                  name: '内存使用率告警',
                  condition: '内存使用率 > 85%',
                  level: 'warning',
                  status: 'enabled',
                },
                {
                  id: 3,
                  name: '磁盘使用率告警',
                  condition: '磁盘使用率 > 80%',
                  level: 'warning',
                  status: 'disabled',
                },
              ]"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="规则名称" />
              <el-table-column prop="condition" label="触发条件" />
              <el-table-column prop="level" label="告警级别" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.level === 'error' ? 'danger' : 'warning'">
                    {{ scope.row.level === 'error' ? '错误' : '警告' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'">
                    {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default>
                  <el-button type="primary" size="small" plain>
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" plain>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 其他页面 -->
        <div v-else>
          <el-card shadow="hover">
            <div class="empty-page">
              <el-empty description="页面开发中..." />
            </div>
          </el-card>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial,
    sans-serif;
}

/* 顶部导航栏 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background-color: #001529;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.logo-icon {
  margin-right: 10px;
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  position: relative;
}

.notification-btn {
  color: #fff;
  font-size: 18px;
}

.user-info {
  display: flex;
  align-items: center;
  color: #fff;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info span {
  margin: 0 8px;
}

/* 主体内容 */
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.app-sidebar {
  width: 200px;
  background-color: #001529;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: width 0.3s;
}

.sidebar-menu {
  height: 100%;
}

.sidebar-menu .el-menu-item {
  height: 60px;
  line-height: 60px;
  margin: 0;
  border-radius: 0;
  font-size: 14px;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #1890ff !important;
}

.sidebar-menu .el-menu-item i {
  font-size: 18px;
  margin-right: 12px;
}

/* 主内容区 */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-actions {
  display: flex;
  gap: 8px;
}

/* 卡片容器 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* 图表容器 */
.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* 信息卡片 */
.info-card {
  transition: all 0.3s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 图表卡片 */
.chart-card {
  height: 350px;
  transition: all 0.3s;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 服务器状态 */
.server-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  transition: color 0.3s;
}

/* 告警消息 */
.alert-message {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 日志表单 */
.log-form {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 进度条文本 */
.progress-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text span {
  min-width: 40px;
  font-size: 12px;
}

/* 空页面 */
.empty-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 文本颜色 */
.text-danger {
  color: #f56c6c !important;
}

.text-warning {
  color: #e6a23c !important;
}

.text-success {
  color: #67c23a !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-sidebar {
    width: 64px;
  }

  .sidebar-menu .el-menu-item span {
    display: none;
  }

  .sidebar-menu .el-menu-item i {
    margin-right: 0;
  }

  .card-container,
  .chart-container {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 16px;
  }

  .logo span {
    display: none;
  }

  .header-info {
    gap: 8px;
  }

  .user-info span {
    display: none;
  }
}
</style>
