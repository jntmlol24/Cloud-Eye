/**
 * 监控相关API接口
 * 提供服务器和应用监控的API调用
 */

// 引入HTTP请求封装
import request from '@/utils/request'

/**
 * 服务器信息接口
 */
export interface ServerInfo {
  id: number // 服务器ID
  name: string // 服务器名称
  ip: string // 服务器IP
  port: number // 服务器端口
  username: string // 服务器用户名
  status: string // 服务器状态
}

/**
 * 服务器状态接口
 */
export interface ServerStats {
  cpu: number // CPU使用率
  memory: number // 内存使用率
  disk: number // 磁盘使用率
  network: number // 网络使用率
}

/**
 * 应用信息接口
 */
export interface AppInfo {
  id: number // 应用ID
  name: string // 应用名称
  url: string // 应用URL
  status: string // 应用状态
}

/**
 * 应用状态接口
 */
export interface AppStats {
  responseTime: number // 响应时间
  throughput: number // 吞吐量
  errorRate: number // 错误率
}

/**
 * 监控API对象
 * 提供服务器和应用监控的API方法
 */
export const monitorApi = {
  /**
   * 获取服务器列表
   * @param params 分页参数
   * @returns 服务器列表
   */
  getServerList: (params: { page: number; size: number }) =>
    request.get('/monitor/server/list', { params }),

  /**
   * 添加服务器
   * @param params 服务器信息
   * @returns 添加的服务器信息
   */
  addServer: (params: Partial<ServerInfo>) => request.post('/monitor/server/add', params),

  /**
   * 更新服务器
   * @param params 服务器信息
   * @returns 更新后的服务器信息
   */
  updateServer: (params: ServerInfo) => request.put('/monitor/server/update', params),

  /**
   * 删除服务器
   * @param id 服务器ID
   * @returns 删除结果
   */
  deleteServer: (id: number) => request.delete(`/monitor/server/delete?id=${id}`),

  /**
   * 获取服务器状态
   * @param id 服务器ID
   * @returns 服务器状态
   */
  getServerStats: (id: number) => request.get<ServerStats>(`/monitor/server/stats?id=${id}`),

  /**
   * 获取应用列表
   * @param params 分页参数
   * @returns 应用列表
   */
  getAppList: (params: { page: number; size: number }) =>
    request.get('/monitor/app/list', { params }),

  /**
   * 获取应用状态
   * @param id 应用ID
   * @returns 应用状态
   */
  getAppStats: (id: number) => request.get<AppStats>(`/monitor/app/stats?id=${id}`),
}
