/**
 * WebSocket管理器
 * 管理多个WebSocket连接，提供统一的访问接口
 */

// 引入WebSocketService类
import WebSocketService from './websocket'

/**
 * WebSocket管理器类
 */
class WebSocketManager {
  private monitorWs: WebSocketService | null = null // 监控WebSocket连接
  private alertWs: WebSocketService | null = null // 告警WebSocket连接

  /**
   * 初始化WebSocket连接
   * 创建并连接监控和告警WebSocket
   */
  init(): void {
    // 从环境变量获取WebSocket基础URL，或使用默认值
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
    
    // 创建监控WebSocket连接
    this.monitorWs = new WebSocketService(`${wsBaseUrl}/ws/monitor`)
    // 创建告警WebSocket连接
    this.alertWs = new WebSocketService(`${wsBaseUrl}/ws/alert`)
    
    // 连接WebSocket
    this.monitorWs.connect()
    this.alertWs.connect()
  }

  /**
   * 获取监控WebSocket连接
   * @returns 监控WebSocket服务实例
   */
  getMonitorWs(): WebSocketService | null {
    return this.monitorWs
  }

  /**
   * 获取告警WebSocket连接
   * @returns 告警WebSocket服务实例
   */
  getAlertWs(): WebSocketService | null {
    return this.alertWs
  }

  /**
   * 销毁WebSocket连接
   * 断开所有WebSocket连接并清空实例
   */
  destroy(): void {
    // 断开监控WebSocket连接
    this.monitorWs?.disconnect()
    // 断开告警WebSocket连接
    this.alertWs?.disconnect()
    // 清空实例
    this.monitorWs = null
    this.alertWs = null
  }
}

/**
 * 导出WebSocketManager单例
 * 供其他文件使用
 */
export default new WebSocketManager()