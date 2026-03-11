/**
 * 路由配置文件
 * 定义应用的路由结构和导航规则
 */

// 引入创建路由的函数
import { createRouter, createWebHistory } from 'vue-router'
// 引入根组件
import App from '../App.vue'
// 引入登录页面组件
import Login from '../views/Login.vue'
// 引入仪表盘页面组件
import Dashboard from '../views/Dashboard.vue'

/**
 * 路由配置数组
 * 定义应用的路由结构
 */
const routes = [
  {
    path: '/', // 根路径
    name: 'Home', // 路由名称
    component: App, // 对应的组件
    children: [
      // 子路由
      {
        path: '', // 默认子路径
        name: 'Dashboard', // 路由名称
        component: Dashboard, // 对应的组件
      },
    ],
  },
  {
    path: '/login', // 登录页面路径
    name: 'Login', // 路由名称
    component: Login, // 对应的组件
  },
]

/**
 * 创建路由实例
 * 使用createWebHistory模式，支持HTML5历史记录
 */
const router = createRouter({
  history: createWebHistory(), // 使用HTML5历史记录模式
  routes, // 路由配置
})

/**
 * 导出路由实例
 * 供main.ts文件使用
 */
export default router
