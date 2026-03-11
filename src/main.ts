/**
 * 应用入口文件
 * 负责创建Vue实例，配置全局插件和挂载应用
 */

// 引入createApp函数,用于创建Vue实例
import { createApp } from 'vue'
// 引入App.vue组件，作为根组件
import App from './App.vue'
// 引入Element Plus UI库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入Element Plus图标组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入ECharts图表库
import * as echarts from 'echarts'
// 引入路由配置
import router from './router'

/**
 * 创建Vue应用实例
 */
const app = createApp(App)

/**
 * 使用Element Plus UI库
 */
app.use(ElementPlus)

/**
 * 注册Element Plus图标组件
 * 将所有图标组件注册为全局组件，方便在模板中直接使用
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/**
 * 使用路由
 */
app.use(router)

/**
 * 全局属性配置
 * 将echarts实例添加到全局属性中，方便在组件中使用
 */
app.config.globalProperties.$echarts = echarts

/**
 * 挂载应用到DOM
 * 将Vue应用实例挂载到id为app的DOM元素上
 */
app.mount('#app')
