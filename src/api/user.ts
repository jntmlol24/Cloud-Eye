/**
 * 用户相关API接口
 * 提供用户登录、获取用户信息和登出等功能的API调用
 */

// 引入HTTP请求封装
import request from '@/utils/request'

/**
 * 登录参数接口
 */
export interface LoginParams {
  username: string // 用户名
  password: string // 密码
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number // 用户ID
  username: string // 用户名
  roles: string[] // 用户角色
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  token: string // 认证令牌
  user: UserInfo // 用户信息
}

/**
 * 用户API对象
 * 提供用户相关的API方法
 */
export const userApi = {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns 登录结果，包含token和用户信息
   */
  login: (params: LoginParams) => 
    request.post<LoginResponse>('/user/login', params),
  
  /**
   * 获取用户信息
   * @returns 用户信息
   */
  getUserInfo: () => 
    request.get<UserInfo>('/user/info'),
  
  /**
   * 用户登出
   * @returns 登出结果
   */
  logout: () => 
    request.post('/user/logout')
}