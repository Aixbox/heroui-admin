// Mock API server — 仅用于本地联调，模拟 RuoYi 风格的后端契约（登录态、角色权限码、动态菜单）。
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const port = Number(process.env.MOCK_API_PORT ?? 8787);
const sessions = new Map();

// 演示账号统一密码；权限码风格 "模块:资源:操作"，"*" 为全通配（RuoYi 惯例）
const DEMO_PASSWORD = "acme-demo-7Kx92m";
const users = [
  {
    id: "usr_001",
    name: "Ada Lovelace",
    email: "admin@acme.com",
    role: "admin",
    roles: ["admin"],
    permissions: ["*"],
  },
  {
    id: "usr_002",
    name: "Grace Hopper",
    email: "editor@acme.com",
    role: "editor",
    roles: ["editor"],
    permissions: [
      "app:overview:view",
      "app:examples:view",
      "app:exceptions:view",
      "app:profile:view",
      "app:settings:view",
      "app:user:list",
    ],
  },
];

// 完整菜单树：后端按角色过滤后下发（前端不再硬编码菜单）
const menus = [
  { key: "overview", label: "概览", icon: "dashboard", href: "/app", end: true },
  {
    key: "examples",
    label: "示例",
    icon: "configuration",
    children: [
      { key: "examples-form", label: "表单", href: "/app/examples/form" },
      { key: "examples-table", label: "表格", href: "/app/examples/table" },
      { key: "examples-captcha", label: "验证码", href: "/app/examples/captcha" },
      { key: "examples-modal", label: "弹窗", href: "/app/examples/modal" },
      { key: "examples-drawer", label: "抽屉", href: "/app/examples/drawer" },
    ],
  },
  {
    key: "exceptions",
    label: "异常页",
    icon: "warning",
    children: [
      { key: "exceptions-404", label: "404", href: "/app/exceptions/404" },
      { key: "exceptions-403", label: "403", href: "/app/exceptions/403" },
      { key: "exceptions-500", label: "500", href: "/app/exceptions/500" },
    ],
  },
  {
    key: "personal",
    label: "个人页",
    icon: "users",
    children: [
      { key: "personal-settings", label: "个人设置", href: "/app/settings" },
      { key: "personal-profile", label: "个人中心", href: "/app/profile" },
    ],
  },
  {
    key: "system",
    label: "系统管理",
    icon: "settings",
    children: [{ key: "system-users", label: "用户管理", icon: "users", href: "/app/users" }],
  },
];

// 模拟按角色过滤：admin 全量；editor 无系统管理
const roleMenus = {
  admin: menus,
  editor: menus.filter((item) => item.key !== "system"),
};

function send(res, status, data, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json", "X-Mock-Api": "true", ...extraHeaders });
  res.end(JSON.stringify(data));
}
function cookieValue(req, name) {
  return req.headers.cookie
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`))
    ?.split("=")[1];
}
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}
async function body(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = cookieValue(req, "acme_mock_session");
  const currentUser = (sessionId && sessions.get(sessionId)) || null;
  if (req.method === "GET" && url.pathname === "/mock-api/health") return send(res, 200, { ok: true, mock: true });
  if (req.method === "POST" && url.pathname === "/mock-api/auth/login") {
    const { email, password } = await body(req);
    const user = users.find((item) => item.email === email);
    if (!user || password !== DEMO_PASSWORD) return send(res, 401, { message: "邮箱或密码不正确" });
    const token = randomBytes(24).toString("hex");
    sessions.set(token, user);
    return send(
      res,
      200,
      { user },
      { "Set-Cookie": `acme_mock_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400` },
    );
  }
  if (req.method === "GET" && url.pathname === "/mock-api/auth/me") {
    return currentUser ? send(res, 200, { user: currentUser }) : send(res, 401, { message: "未登录" });
  }
  if (req.method === "GET" && url.pathname === "/mock-api/auth/menus") {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    return send(res, 200, { menus: roleMenus[currentUser.role] ?? [] });
  }
  if (req.method === "POST" && url.pathname === "/mock-api/auth/logout") {
    if (sessionId) sessions.delete(sessionId);
    return send(
      res,
      200,
      { ok: true },
      { "Set-Cookie": "acme_mock_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0" },
    );
  }
  if (req.method === "GET" && url.pathname === "/mock-api/dashboard/stats") {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    return send(res, 200, { revenue: "¥128,430", orders: 1248, customers: 8420, conversion: "12.8%" });
  }
  return send(res, 404, { message: "Mock API route not found" });
});

server.listen(port, () => console.log(`[Mock API] listening on http://localhost:${port}`));
