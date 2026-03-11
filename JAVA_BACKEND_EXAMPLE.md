# Java后端示例（Spring Boot）

## 项目结构

```
cloud-eye-backend/
├── src/main/java/com/cloudeye/
│   ├── CloudEyeApplication.java
│   ├── config/
│   │   ├── CorsConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   ├── MonitorController.java
│   │   └── UserController.java
│   ├── dto/
│   │   ├── ServerInfo.java
│   │   ├── ServerStats.java
│   │   ├── AppInfo.java
│   │   ├── AppStats.java
│   │   └── LoginRequest.java
│   ├── service/
│   │   ├── MonitorService.java
│   │   └── UserService.java
│   ├── utils/
│   │   └── JwtUtils.java
│   └── filter/
│       └── JwtAuthenticationFilter.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

## 依赖配置（pom.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.cloudeye</groupId>
    <artifactId>cloud-eye-backend</artifactId>
    <version>1.0.0</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.9.1</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

## 应用配置（application.yml）

```yaml
spring:
  application:
    name: cloud-eye-backend

server:
  port: 8080
  servlet:
    context-path: /api

jwt:
  secret: your-secret-key
  expiration: 86400000 # 24 hours
```

## 主应用类（CloudEyeApplication.java）

```java
package com.cloudeye;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CloudEyeApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudEyeApplication.class, args);
    }
}
```

## 配置类

### CORS配置（CorsConfig.java）

```java
package com.cloudeye.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*", "Authorization")
                .exposedHeaders("*").maxAge(3600);
    }
}
```

### 安全配置（SecurityConfig.java）

```java
package com.cloudeye.config;

import com.cloudeye.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeRequests(authorize -> authorize
                .antMatchers("/user/login").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

## 数据模型

### ServerInfo.java

```java
package com.cloudeye.dto;

import lombok.Data;

@Data
public class ServerInfo {
    private Integer id;
    private String name;
    private String ip;
    private Integer port;
    private String username;
    private String status;
}
```

### ServerStats.java

```java
package com.cloudeye.dto;

import lombok.Data;

@Data
public class ServerStats {
    private Integer cpu;
    private Integer memory;
    private Integer disk;
    private Integer network;
}
```

### AppInfo.java

```java
package com.cloudeye.dto;

import lombok.Data;

@Data
public class AppInfo {
    private Integer id;
    private String name;
    private String url;
    private String status;
}
```

### AppStats.java

```java
package com.cloudeye.dto;

import lombok.Data;

@Data
public class AppStats {
    private Integer responseTime;
    private Integer throughput;
    private Double errorRate;
}
```

### LoginRequest.java

```java
package com.cloudeye.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
```

## 工具类

### JwtUtils.java

```java
package com.cloudeye.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
```

## 过滤器

### JwtAuthenticationFilter.java

```java
package com.cloudeye.filter;

import com.cloudeye.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            try {
                Claims claims = jwtUtils.parseToken(token);
                String username = claims.getSubject();
                UserDetails userDetails = new User(username, "", new ArrayList<>());
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception e) {
                logger.error("JWT token validation failed: " + e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }
}
```

## 服务类

### MonitorService.java

```java
package com.cloudeye.service;

import com.cloudeye.dto.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MonitorService {
    // 模拟数据
    private final List<ServerInfo> serverList = new ArrayList<>();
    private final List<AppInfo> appList = new ArrayList<>();
    private final Random random = new Random();

    public MonitorService() {
        // 初始化模拟数据
        for (int i = 1; i <= 3; i++) {
            ServerInfo server = new ServerInfo();
            server.setId(i);
            server.setName("服务器" + i);
            server.setIp("192.168.1.10" + i);
            server.setPort(22);
            server.setUsername("admin");
            server.setStatus("running");
            serverList.add(server);
        }

        for (int i = 1; i <= 4; i++) {
            AppInfo app = new AppInfo();
            app.setId(i);
            app.setName("应用" + i);
            app.setUrl("http://localhost:808" + i);
            app.setStatus("running");
            appList.add(app);
        }
    }

    // 获取服务器列表
    public List<ServerInfo> getServerList(int page, int size) {
        // 实际项目中应该从数据库查询
        return serverList;
    }

    // 添加服务器
    public ServerInfo addServer(ServerInfo serverInfo) {
        // 实际项目中应该保存到数据库
        serverInfo.setId(serverList.size() + 1);
        serverInfo.setStatus("running");
        serverList.add(serverInfo);
        return serverInfo;
    }

    // 更新服务器
    public ServerInfo updateServer(ServerInfo serverInfo) {
        // 实际项目中应该更新数据库
        for (int i = 0; i < serverList.size(); i++) {
            if (serverList.get(i).getId().equals(serverInfo.getId())) {
                serverList.set(i, serverInfo);
                return serverInfo;
            }
        }
        return null;
    }

    // 删除服务器
    public boolean deleteServer(Integer id) {
        // 实际项目中应该从数据库删除
        return serverList.removeIf(server -> server.getId().equals(id));
    }

    // 获取服务器状态
    public ServerStats getServerStats(Integer id) {
        // 实际项目中应该从监控系统获取
        ServerStats stats = new ServerStats();
        stats.setCpu(random.nextInt(100));
        stats.setMemory(random.nextInt(100));
        stats.setDisk(random.nextInt(100));
        stats.setNetwork(random.nextInt(100));
        return stats;
    }

    // 获取应用列表
    public List<AppInfo> getAppList(int page, int size) {
        // 实际项目中应该从数据库查询
        return appList;
    }

    // 获取应用状态
    public AppStats getAppStats(Integer id) {
        // 实际项目中应该从监控系统获取
        AppStats stats = new AppStats();
        stats.setResponseTime(random.nextInt(300));
        stats.setThroughput(random.nextInt(5000));
        stats.setErrorRate(random.nextDouble() * 2);
        return stats;
    }
}
```

### UserService.java

```java
package com.cloudeye.service;

import com.cloudeye.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    private JwtUtils jwtUtils;

    // 模拟用户数据
    private final Map<String, String> users = new HashMap<>();

    public UserService() {
        // 初始化模拟用户
        users.put("admin", "admin123");
        users.put("user", "user123");
    }

    // 登录
    public Map<String, Object> login(String username, String password) {
        Map<String, Object> result = new HashMap<>();
        if (users.containsKey(username) && users.get(username).equals(password)) {
            String token = jwtUtils.generateToken(username);
            result.put("code", 200);
            result.put("data", token);
            result.put("message", "登录成功");
        } else {
            result.put("code", 401);
            result.put("message", "用户名或密码错误");
        }
        return result;
    }
}
```

## 控制器

### MonitorController.java

```java
package com.cloudeye.controller;

import com.cloudeye.dto.*;
import com.cloudeye.service.MonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/monitor")
public class MonitorController {
    @Autowired
    private MonitorService monitorService;

    // 获取服务器列表
    @GetMapping("/server/list")
    public Map<String, Object> getServerList(@RequestParam int page, @RequestParam int size) {
        List<ServerInfo> servers = monitorService.getServerList(page, size);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", servers);
        result.put("message", "成功");
        return result;
    }

    // 添加服务器
    @PostMapping("/server/add")
    public Map<String, Object> addServer(@RequestBody ServerInfo serverInfo) {
        ServerInfo server = monitorService.addServer(serverInfo);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", server);
        result.put("message", "成功");
        return result;
    }

    // 更新服务器
    @PutMapping("/server/update")
    public Map<String, Object> updateServer(@RequestBody ServerInfo serverInfo) {
        ServerInfo server = monitorService.updateServer(serverInfo);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", server);
        result.put("message", "成功");
        return result;
    }

    // 删除服务器
    @DeleteMapping("/server/delete")
    public Map<String, Object> deleteServer(@RequestParam Integer id) {
        boolean success = monitorService.deleteServer(id);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", success);
        result.put("message", "成功");
        return result;
    }

    // 获取服务器状态
    @GetMapping("/server/stats")
    public Map<String, Object> getServerStats(@RequestParam Integer id) {
        ServerStats stats = monitorService.getServerStats(id);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", stats);
        result.put("message", "成功");
        return result;
    }

    // 获取应用列表
    @GetMapping("/app/list")
    public Map<String, Object> getAppList(@RequestParam int page, @RequestParam int size) {
        List<AppInfo> apps = monitorService.getAppList(page, size);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", apps);
        result.put("message", "成功");
        return result;
    }

    // 获取应用状态
    @GetMapping("/app/stats")
    public Map<String, Object> getAppStats(@RequestParam Integer id) {
        AppStats stats = monitorService.getAppStats(id);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", stats);
        result.put("message", "成功");
        return result;
    }
}
```

### UserController.java

```java
package com.cloudeye.controller;

import com.cloudeye.dto.LoginRequest;
import com.cloudeye.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    // 登录
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }
}
```

## 运行说明

1. 克隆项目到本地
2. 进入项目目录，执行 `mvn clean install` 构建项目
3. 执行 `java -jar target/cloud-eye-backend-1.0.0.jar` 启动应用
4. 应用将在 `http://localhost:8080/api` 上运行

## 测试API

### 1. 登录获取Token

**请求**：

```bash
POST http://localhost:8080/api/user/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应**：

```json
{
  "code": 200,
  "data": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwOTI1NjAwMCwiaWF0IjoxNzA5MTY5NjAwfQ.6e7f8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w",
  "message": "登录成功"
}
```

### 2. 获取服务器状态（需要Token）

**请求**：

```bash
GET http://localhost:8080/api/monitor/server/stats?id=1
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwOTI1NjAwMCwiaWF0IjoxNzA5MTY5NjAwfQ.6e7f8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w
```

**响应**：

```json
{
  "code": 200,
  "data": {
    "cpu": 65,
    "memory": 78,
    "disk": 45,
    "network": 32
  },
  "message": "成功"
}
```

## 注意事项

1. 本示例使用了模拟数据，实际项目中应该从数据库或监控系统获取真实数据
2. 本示例使用了简单的JWT认证，实际项目中应该使用更安全的认证方式
3. 本示例没有实现完整的错误处理和日志记录，实际项目中应该添加
4. 本示例没有实现数据库连接，实际项目中应该添加数据库配置

## 技术栈

- Spring Boot 3.2.0
- Spring Security
- JWT
- Lombok
- Maven

这个后端示例完全匹配前端的API调用方式，可以直接与前端应用集成使用。
