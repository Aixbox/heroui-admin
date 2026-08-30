# Acme Admin

基于 React Router 7、HeroUI 3 和 Mock API 的通用管理系统前端模板。

## 技术架构

- React Router 7：Framework Mode、SSR、嵌套路由和 loader 权限校验（requireUser / requirePermi / requireRole）
- HeroUI 3 + Tailwind CSS 4：组件系统与界面主题（深浅色 + View Transition 切换动画）
- TanStack Query：服务端数据缓存和请求状态（列表分页使用 keepPreviousData）
- Zustand：当前用户、界面语言等跨页面客户端状态
- React Hook Form + Zod：统一表单方案与类型安全校验
- Recharts：仪表盘图表（曲线 / 饼图 / 柱状 / 折线）
- Mock API（仅本地联调）：模拟 RuoYi 风格契约——认证会话、角色权限码、按角色下发的动态菜单、分页列表

## 本地启动

一条命令同时启动 Mock API 和 React Router 应用：

```bash
pnpm dev
```

其中 Mock API 默认监听 `http://localhost:8787`，前端默认监听 `http://localhost:5173`。前端开发服务器会将 `/mock-api` 代理到 Mock API。SSR 请求通过环境变量 `MOCK_API_URL` 指向 Mock API，未设置时使用同一默认地址。

如需分别调试，可以在两个终端分别运行 `pnpm dev:mock-api` 和 `pnpm dev:web`。注意：Mock API 为普通 Node 进程，修改 `mock-api/server.mjs` 后需手动重启。

## 演示账号（密码均为 `acme-demo-7Kx92m`）

| 账号              | 角色     | 权限差异                                                         |
| ----------------- | -------- | ---------------------------------------------------------------- |
| `admin@acme.com`  | 管理员   | `*` 全通配：可见系统管理菜单，用户页有新增/编辑/删除按钮         |
| `editor@acme.com` | 普通用户 | 仅查看类权限：无系统管理菜单，深链进入用户页只有表格没有操作按钮 |

## 功能一览

- 登录/注册（Mock 会话），服务端 loader 权限守卫 + 按钮级权限（`usePermission` + `<Access>`）
- 动态菜单：后端按角色下发菜单树，侧边栏 / 面包屑 / 命令面板 / 移动端抽屉自动跟随
- 侧边栏折叠（图标模式 + 弹出二级菜单）、移动端抽屉、多标签页、全屏切换
- 顶栏：定宽/全宽、深浅色、中英双语（i18n 回退原文，可渐进补词典）、通知中心、用户卡片
- `Ctrl/Cmd + K` 全局搜索命令面板
- 概览仪表盘：指标卡 + 曲线/饼图/柱状/折线 + 最近订单表格
- 示例页：表单（统一表单方案参考实现）、表格、验证码（InputOTP）、弹窗、抽屉
- 异常页演示（404/403/500）+ 根级错误边界 + 兜底 404 路由
- 界面偏好持久化（侧边栏折叠 / 内容全宽 / 语言）

## 路由

- `/login`：登录 / 注册
- `/app`：概览仪表盘
- `/app/examples/*`：表单、表格、验证码、弹窗、抽屉组件示例
- `/app/exceptions/404|403|500`：异常页演示
- `/app/settings`、`/app/profile`：个人设置、个人中心
- `/app/users`：用户管理（admin 专属菜单，需 `app:user:list` 权限）
- `*`：兜底 404（公共可访问）

## 常用脚本

| 脚本                                | 说明                           |
| ----------------------------------- | ------------------------------ |
| `pnpm dev`                          | 启动 Mock API + 前端开发服务器 |
| `pnpm build`                        | 生产构建（Node 服务器产物）    |
| `pnpm lint` / `pnpm lint:check`     | ESLint 自动修复 / 只检查       |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 只检查       |
| `pnpm typecheck`                    | react-router typegen + tsc     |
| `pnpm test`                         | Vitest 单元测试                |

## 开发约定

组件使用规范、Surface 嵌套与 variant 规则、类名拼接、i18n 接入方式等见 [AGENTS.md](./AGENTS.md)。新增页面前先看 `.heroui-docs/react/demos/cn/<组件名>/` 下的官方 demo，从 demo 复制结构再改业务。

## 验证

```bash
pnpm lint:check && pnpm typecheck && pnpm test && pnpm build
```

`mock-api/server.mjs` 明确标记为 Mock API，禁止作为生产后端使用。接入正式后端时，替换 `app/lib/mock-api.ts` 模块（保持 PageQuery/PageResult 等契约）、`MOCK_API_URL` 配置和相关 loader/action 请求即可；生产环境应使用正式后端提供的数据库、密码哈希和持久化会话。
