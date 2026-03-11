/**
 * HTTP请求封装
 * 基于axios实现，提供请求/响应拦截、错误处理等功能
 */

// 引入axios库
import axios from 'axios'
// 引入Element Plus的消息组件
import { ElMessage } from 'element-plus'

/**
 * 创建axios实例
 * 配置基础URL、超时时间和默认请求头
 */
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', // 基础URL，从环境变量获取或使用默认值
  timeout: 15000, // 超时时间，15秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8', // 默认请求头
  },
})

/**
 * 请求拦截器
 * 在发送请求前做处理，如添加token
 */
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // 如果token存在，添加到请求头
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 处理请求错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 * 在接收响应后做处理，如统一错误处理
 */
service.interceptors.response.use(
  (response) => {
    // 从响应数据中解构出code、data和message
    const { code, data, message } = response.data

    // 根据code判断响应状态
    if (code === 200) {
      // 成功，返回数据
      return data
    } else if (code === 401) {
      // 未授权，跳转到登录页
      ElMessage.error('未授权，请重新登录')
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(new Error(message || '未授权'))
    } else {
      // 其他错误，显示错误信息
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    // 处理响应错误
    console.error('响应错误:', error)

    // 根据错误类型进行处理
    if (error.response) {
      // 服务器返回错误
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
      // 请求已发送但没有收到响应
      ElMessage.error('网络连接失败')
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  },
)

/**
 * 导出axios实例
 * 供其他文件使用
 */
export default service
