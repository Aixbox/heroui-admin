# Acme Admin

基于 React Router 7、HeroUI 3 和独立后端 API 的后台管理应用骨架。

## 技术架构

- React Router 7：Framework Mode、SSR、嵌套路由和 loader 权限校验
- HeroUI 3 + Tailwind CSS 4：后台界面和组件系统
- TanStack Query：服务端数据缓存和请求状态
- Zustand：当前用户等跨页面客户端状态
- React Hook Form + Zod：表单状态和类型安全校验
- 独立 Node API：认证、HttpOnly Cookie 会话和业务数据接口

## 本地启动

推荐打开两个终端：

```powershell
# 终端一：独立 API，默认 http://localhost:8787
pnpm dev:api

# 终端二：React Router 应用
pnpm dev
```

前端开发服务器会将 `/api` 代理到 `http://localhost:8787`。SSR 请求通过环境变量 `API_URL` 指向 API，未设置时使用同一默认地址。

## 演示账号

```text
邮箱：admin@acme.com
密码：admin123
```

## 路由

- `/login`：登录页
- `/app`：受保护的后台概览
- `/app/users`：受保护的用户管理
- `/app/settings`：仅管理员可访问的系统设置

## 验证

```powershell
pnpm typecheck
pnpm build
```

`api/server.mjs` 是便于本地开发的独立 API 示例。生产环境应将内存会话和演示用户替换为数据库、密码哈希、持久化 Session 或成熟身份服务。
