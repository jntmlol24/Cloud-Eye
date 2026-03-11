# CloudEye - 智能运维监控平台后端接口文档

## 1. 接口概述

本文档描述了CloudEye智能运维监控平台的后端API接口设计，包括用户服务、监控服务、告警服务、日志服务、报表服务、配置服务和任务服务的接口定义。

## 2. 基础信息

- **API基础路径**: `/api`
- **认证方式**: JWT Token
- **请求格式**: JSON
- **响应格式**: JSON
- **状态码**: 200(成功)、400(请求错误)、401(未授权)、403(禁止访问)、500(服务器错误)

## 3. 接口列表

### 3.1 用户服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/user/login` | `POST` | 用户登录 | `{"username": "admin", "password": "123456"}` | `{"code": 200, "data": {"token": "...", "user": {...}}, "message": "登录成功"}` |
| `/api/user/info` | `GET` | 获取用户信息 | 无 | `{"code": 200, "data": {"id": 1, "username": "admin", "roles": [...]}, "message": "获取成功"}` |
| `/api/user/logout` | `POST` | 用户登出 | 无 | `{"code": 200, "data": null, "message": "登出成功"}` |

### 3.2 监控服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/monitor/server/list` | `GET` | 获取服务器列表 | `page: number, size: number` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "获取成功"}` |
| `/api/monitor/server/add` | `POST` | 添加服务器 | `{"name": "服务器1", "ip": "192.168.1.100", "port": 22, "username": "root", "password": "123456"}` | `{"code": 200, "data": {"id": 1}, "message": "添加成功"}` |
| `/api/monitor/server/update` | `PUT` | 更新服务器 | `{"id": 1, "name": "服务器1", "ip": "192.168.1.100", "port": 22, "username": "root", "password": "123456"}` | `{"code": 200, "data": null, "message": "更新成功"}` |
| `/api/monitor/server/delete` | `DELETE` | 删除服务器 | `id: number` | `{"code": 200, "data": null, "message": "删除成功"}` |
| `/api/monitor/server/stats` | `GET` | 获取服务器状态 | `id: number` | `{"code": 200, "data": {"cpu": 65, "memory": 78, "disk": 45, "network": 32}, "message": "获取成功"}` |
| `/api/monitor/app/list` | `GET` | 获取应用列表 | `page: number, size: number` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "获取成功"}` |
| `/api/monitor/app/stats` | `GET` | 获取应用性能 | `id: number` | `{"code": 200, "data": {"responseTime": 120, "throughput": 1500, "errorRate": 0.5}, "message": "获取成功"}` |

### 3.3 告警服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/alert/rule/list` | `GET` | 获取告警规则列表 | `page: number, size: number` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "获取成功"}` |
| `/api/alert/rule/add` | `POST` | 添加告警规则 | `{"name": "CPU使用率告警", "condition": "CPU使用率 > 90%", "level": "error", "status": "enabled"}` | `{"code": 200, "data": {"id": 1}, "message": "添加成功"}` |
| `/api/alert/rule/update` | `PUT` | 更新告警规则 | `{"id": 1, "name": "CPU使用率告警", "condition": "CPU使用率 > 90%", "level": "error", "status": "enabled"}` | `{"code": 200, "data": null, "message": "更新成功"}` |
| `/api/alert/rule/delete` | `DELETE` | 删除告警规则 | `id: number` | `{"code": 200, "data": null, "message": "删除成功"}` |
| `/api/alert/list` | `GET` | 获取告警列表 | `page: number, size: number, level: string, timeRange: string` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "获取成功"}` |
| `/api/alert/handle` | `POST` | 处理告警 | `{"id": 1, "status": "processed", "remark": "已处理"}` | `{"code": 200, "data": null, "message": "处理成功"}` |

### 3.4 日志服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/log/search` | `POST` | 搜索日志 | `{"timeRange": ["2026-03-10 00:00:00", "2026-03-10 23:59:59"], "level": "ERROR", "keyword": "数据库连接失败", "source": "应用A"}` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "搜索成功"}` |
| `/api/log/export` | `POST` | 导出日志 | `{"timeRange": ["2026-03-10 00:00:00", "2026-03-10 23:59:59"], "level": "ERROR", "keyword": "数据库连接失败", "source": "应用A"}` | `{"code": 200, "data": {"url": "..."}, "message": "导出成功"}` |
| `/api/log/analyze` | `POST` | 日志分析 | `{"timeRange": ["2026-03-10 00:00:00", "2026-03-10 23:59:59"], "source": "应用A"}` | `{"code": 200, "data": {"levelStats": {...}, "sourceStats": {...}}, "message": "分析成功"}` |

### 3.5 报表服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/report/server` | `GET` | 服务器报表 | `timeRange: string` | `{"code": 200, "data": {"cpu": [...], "memory": [...], "disk": [...], "network": [...]}, "message": "获取成功"}` |
| `/api/report/app` | `GET` | 应用报表 | `timeRange: string` | `{"code": 200, "data": {"responseTime": [...], "throughput": [...], "errorRate": [...]}, "message": "获取成功"}` |
| `/api/report/alert` | `GET` | 告警报表 | `timeRange: string` | `{"code": 200, "data": {"levelStats": {...}, "sourceStats": {...}}, "message": "获取成功"}` |
| `/api/report/export` | `POST` | 导出报表 | `{"type": "server", "timeRange": ["2026-03-10 00:00:00", "2026-03-10 23:59:59"]}` | `{"code": 200, "data": {"url": "..."}, "message": "导出成功"}` |

### 3.6 配置服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/config/list` | `GET` | 获取配置列表 | 无 | `{"code": 200, "data": [{"key": "monitor.interval", "value": "30", "description": "监控间隔(秒)"}], "message": "获取成功"}` |
| `/api/config/update` | `PUT` | 更新配置 | `{"key": "monitor.interval", "value": "60"}` | `{"code": 200, "data": null, "message": "更新成功"}` |
| `/api/config/add` | `POST` | 添加配置 | `{"key": "alert.email", "value": "admin@example.com", "description": "告警邮箱"}` | `{"code": 200, "data": null, "message": "添加成功"}` |
| `/api/config/delete` | `DELETE` | 删除配置 | `key: string` | `{"code": 200, "data": null, "message": "删除成功"}` |

### 3.7 任务服务

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/task/list` | `GET` | 获取任务列表 | `page: number, size: number` | `{"code": 200, "data": {"list": [...], "total": 10}, "message": "获取成功"}` |
| `/api/task/add` | `POST` | 添加任务 | `{"name": "服务器状态检查", "cron": "0 */5 * * * *", "type": "monitor", "params": {"serverId": 1}}` | `{"code": 200, "data": {"id": 1}, "message": "添加成功"}` |
| `/api/task/update` | `PUT` | 更新任务 | `{"id": 1, "name": "服务器状态检查", "cron": "0 */10 * * * *", "type": "monitor", "params": {"serverId": 1}}` | `{"code": 200, "data": null, "message": "更新成功"}` |
| `/api/task/delete` | `DELETE` | 删除任务 | `id: number` | `{"code": 200, "data": null, "message": "删除成功"}` |
| `/api/task/start` | `POST` | 启动任务 | `id: number` | `{"code": 200, "data": null, "message": "启动成功"}` |
| `/api/task/stop` | `POST` | 停止任务 | `id: number` | `{"code": 200, "data": null, "message": "停止成功"}` |

## 4. WebSocket接口

### 4.1 实时监控数据

- **连接路径**: `/ws/monitor`
- **消息格式**: JSON
- **示例消息**:
  ```json
  {
    "type": "serverStats",
    "data": {
      "serverId": 1,
      "cpu": 65,
      "memory": 78,
      "disk": 45,
      "network": 32,
      "timestamp": "2026-03-10 10:30:00"
    }
  }
  ```

### 4.2 实时告警

- **连接路径**: `/ws/alert`
- **消息格式**: JSON
- **示例消息**:
  ```json
  {
    "type": "alert",
    "data": {
      "id": 1,
      "level": "error",
      "message": "服务器CPU使用率超过90%",
      "serverId": 1,
      "time": "2026-03-10 10:30:00"
    }
  }
  ```

## 5. 数据模型

### 5.1 用户模型

```json
{
  "id": 1,
  "username": "admin",
  "password": "$2a$10$...", // 加密后的密码
  "roles": ["admin"],
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

### 5.2 服务器模型

```json
{
  "id": 1,
  "name": "服务器1",
  "ip": "192.168.1.100",
  "port": 22,
  "username": "root",
  "password": "$2a$10$...", // 加密后的密码
  "status": "running",
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

### 5.3 应用模型

```json
{
  "id": 1,
  "name": "应用A",
  "url": "http://localhost:8080",
  "status": "running",
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

### 5.4 告警规则模型

```json
{
  "id": 1,
  "name": "CPU使用率告警",
  "condition": "CPU使用率 > 90%",
  "level": "error",
  "status": "enabled",
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

### 5.5 告警模型

```json
{
  "id": 1,
  "level": "error",
  "message": "服务器CPU使用率超过90%",
  "serverId": 1,
  "appId": null,
  "status": "unprocessed",
  "handleTime": null,
  "handleUser": null,
  "remark": null,
  "createTime": "2026-03-10 10:30:00",
  "updateTime": "2026-03-10 10:30:00"
}
```

### 5.6 日志模型

```json
{
  "id": 1,
  "time": "2026-03-10 10:30:00",
  "level": "ERROR",
  "message": "数据库连接失败",
  "source": "应用A",
  "detail": "...",
  "createTime": "2026-03-10 10:30:00"
}
```

### 5.7 配置模型

```json
{
  "id": 1,
  "key": "monitor.interval",
  "value": "30",
  "description": "监控间隔(秒)",
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

### 5.8 任务模型

```json
{
  "id": 1,
  "name": "服务器状态检查",
  "cron": "0 */5 * * * *",
  "type": "monitor",
  "params": "{\"serverId\": 1}",
  "status": "running",
  "lastExecuteTime": "2026-03-10 10:30:00",
  "nextExecuteTime": "2026-03-10 10:35:00",
  "createTime": "2026-03-10 08:00:00",
  "updateTime": "2026-03-10 08:00:00"
}
```

## 6. 错误码

| 错误码 | 描述 |
| :--- | :--- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 服务未实现 |
| 502 | 网关错误 |
| 503 | 服务不可用 |
| 504 | 网关超时 |

## 7. 安全措施

1. **JWT认证**: 使用JSON Web Token进行身份验证，确保API访问安全
2. **密码加密**: 用户密码使用bcrypt等算法加密存储
3. **HTTPS**: 生产环境使用HTTPS协议，防止数据传输被窃取
4. **请求频率限制**: 对API请求进行频率限制，防止暴力攻击
5. **输入验证**: 对所有输入参数进行严格验证，防止SQL注入等攻击
6. **权限控制**: 基于角色的权限控制，确保用户只能访问授权的资源
7. **日志审计**: 记录所有API操作日志，便于安全审计和问题排查

## 8. 部署建议

1. **微服务部署**: 使用Kubernetes进行容器化部署，实现服务的自动伸缩和负载均衡
2. **数据库高可用**: 使用MySQL主从复制，确保数据安全和高可用性
3. **缓存策略**: 使用Redis Cluster作为缓存，提高系统性能
4. **消息队列**: 使用RabbitMQ处理异步任务，提高系统可靠性
5. **监控告警**: 部署Prometheus和Grafana，对系统本身进行监控
6. **备份策略**: 定期对数据库和配置进行备份，确保数据安全
7. **灾备方案**: 实现跨区域灾备，确保系统在极端情况下的可用性

## 9. 接口版本管理

API接口采用RESTful风格，版本号通过URL路径进行管理，例如：

- `/api/v1/user/login` - v1版本的登录接口
- `/api/v2/user/login` - v2版本的登录接口

当接口发生不兼容变更时，会增加新版本号，同时保持旧版本接口的可用性，确保平滑升级。