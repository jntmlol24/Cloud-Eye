/**
 * WebSocket服务类
 * 封装WebSocket连接，提供连接管理、消息发送和接收等功能
 */

// 引入Element Plus的消息组件
import { ElMessage } from 'element-plus'

/**
 * WebSocket消息类型
 */
export type WebSocketMessageType = 'serverStats' | 'alert' | 'log'

/**
 * WebSocket消息接口
 */
export interface WebSocketMessage {
  type: WebSocketMessageType // 消息类型
  data: any // 消息数据
}

/**
 * WebSocket消息处理函数类型
 */
export type WebSocketMessageHandler = (message: WebSocketMessage) => void

/**
 * WebSocket服务类
 */
class WebSocketService {
  private ws: WebSocket | null = null // WebSocket实例
  private url: string // WebSocket连接地址
  private reconnectTimer: number | null = null // 重连定时器
  private reconnectAttempts = 0 // 重连次数
  private maxReconnectAttempts = 5 // 最大重连次数
  private reconnectInterval = 3000 // 重连间隔（毫秒）
  private messageHandlers: Map<WebSocketMessageType, Set<WebSocketMessageHandler>> = new Map() // 消息处理函数映射
  private isManualClose = false // 是否手动关闭

  /**
   * 构造函数
   * @param url WebSocket连接地址
   */
  constructor(url: string) {
    this.url = url
  }

  /**
   * 连接WebSocket
   */
  connect(): void {
    // 如果WebSocket已经连接，直接返回
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已经连接')
      return
    }

    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      // 构建WebSocket连接地址
      const wsUrl = `${this.url}?token=${token}`
      // 创建WebSocket实例
      this.ws = new WebSocket(wsUrl)
      
      // 连接成功回调
      this.ws.onopen = () => {
        console.log('WebSocket连接成功')
        // 重置重连次数
        this.reconnectAttempts = 0
        // 标记为非手动关闭
        this.isManualClose = false
      }

      // 接收消息回调
      this.ws.onmessage = (event: MessageEvent) => {
        try {
          // 解析消息
          const message: WebSocketMessage = JSON.parse(event.data)
          // 处理消息
          this.handleMessage(message)
        } catch (error) {
          console.error('解析WebSocket消息失败:', error)
        }
      }

      // 错误回调
      this.ws.onerror = (error: Event) => {
        console.error('WebSocket错误:', error)
      }

      // 关闭回调
      this.ws.onclose = () => {
        console.log('WebSocket连接关闭')
        // 如果不是手动关闭且未达到最大重连次数，尝试重连
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      // 连接失败，尝试重连
      this.reconnect()
    }
  }

  /**
   * 重连WebSocket
   */
  private reconnect(): void {
    // 清除之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    // 增加重连次数
    this.reconnectAttempts++
    console.log(`尝试重新连接WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    // 如果未达到最大重连次数，设置重连定时器
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimer = window.setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      // 达到最大重连次数，停止重连
      console.log('WebSocket连接失败，已达到最大重试次数')
      // 可以在这里添加一个事件通知前端连接失败
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    // 标记为手动关闭
    this.isManualClose = true
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    // 关闭WebSocket连接
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * 发送消息
   * @param message 消息内容
   */
  send(message: any): void {
    // 如果WebSocket已连接，发送消息
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket未连接，无法发送消息')
    }
  }

  /**
   * 注册消息处理函数
   * @param type 消息类型
   * @param handler 处理函数
   */
  on(type: WebSocketMessageType, handler: WebSocketMessageHandler): void {
    // 如果该类型的处理函数集合不存在，创建一个
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    // 添加处理函数
    this.messageHandlers.get(type)!.add(handler)
  }

  /**
   * 取消注册消息处理函数
   * @param type 消息类型
   * @param handler 处理函数
   */
  off(type: WebSocketMessageType, handler: WebSocketMessageHandler): void {
    // 获取该类型的处理函数集合
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      // 删除处理函数
      handlers.delete(handler)
      // 如果处理函数集合为空，删除该类型
      if (handlers.size === 0) {
        this.messageHandlers.delete(type)
      }
    }
  }

  /**
   * 处理消息
   * @param message 消息
   */
  private handleMessage(message: WebSocketMessage): void {
    // 获取该类型的处理函数集合
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      // 遍历执行所有处理函数
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

/**
 * 导出WebSocketService类
 * 供其他文件使用
 */
export default WebSocketService