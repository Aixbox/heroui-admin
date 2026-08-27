# Acme Admin

基于 React Router 7、HeroUI 3 和 Mock API 的后台管理应用骨架。

## 技术架构

- React Router 7：Framework Mode、SSR、嵌套路由和 loader 权限校验
- HeroUI 3 + Tailwind CSS 4：后台界面和组件系统
- TanStack Query：服务端数据缓存和请求状态
- Zustand：当前用户等跨页面客户端状态
- React Hook Form + Zod：表单状态和类型安全校验
- Mock API（仅本地联调）：模拟认证、HttpOnly Cookie 会话和业务数据接口

## 本地启动

一条命令同时启动 Mock API 和 React Router 应用：

```powershell
pnpm dev
```

其中 Mock API 默认监听 `http://localhost:8787`，前端默认监听 `http://localhost:5173`。前端开发服务器会将 `/mock-api` 代理到 Mock API。SSR 请求通过环境变量 `MOCK_API_URL` 指向 Mock API，未设置时使用同一默认地址。

如需分别调试，也可以在两个终端运行 `pnpm dev:mock-api` 和 `pnpm dev:web`。

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

`mock-api/server.mjs` 明确标记为 Mock API，禁止作为生产后端使用。后续接入正式后端时，替换 `app/lib/mock-api.ts` 模块、`MOCK_API_URL` 配置和相关 loader/action 请求即可。生产环境应使用正式后端提供的数据库、密码哈希和持久化 Session。
