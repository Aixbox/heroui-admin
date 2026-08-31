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

// 用户列表数据（分页 + 关键字过滤演示）
const mockUsers = [
  { id: "usr_001", name: "Ada Lovelace", email: "admin@acme.com", role: "管理员", status: "活跃" },
  { id: "usr_002", name: "Grace Hopper", email: "grace@acme.com", role: "编辑者", status: "活跃" },
  { id: "usr_003", name: "Alan Turing", email: "alan@acme.com", role: "编辑者", status: "待审核" },
  { id: "usr_004", name: "Marie Curie", email: "marie@acme.com", role: "编辑者", status: "活跃" },
  { id: "usr_005", name: "Isaac Newton", email: "isaac@acme.com", role: "查看者", status: "停用" },
  { id: "usr_006", name: "Katherine Johnson", email: "katherine@acme.com", role: "编辑者", status: "活跃" },
  { id: "usr_007", name: "Nikola Tesla", email: "nikola@acme.com", role: "查看者", status: "待审核" },
  { id: "usr_008", name: "Rosalind Franklin", email: "rosalind@acme.com", role: "编辑者", status: "活跃" },
  { id: "usr_009", name: "George Boole", email: "george@acme.com", role: "查看者", status: "停用" },
  { id: "usr_010", name: "Ada Lovelace Jr", email: "ada2@acme.com", role: "编辑者", status: "活跃" },
  { id: "usr_011", name: "Charles Babbage", email: "charles@acme.com", role: "查看者", status: "活跃" },
  { id: "usr_012", name: "Hedy Lamarr", email: "hedy@acme.com", role: "编辑者", status: "待审核" },
  { id: "usr_013", name: "John von Neumann", email: "von@acme.com", role: "管理员", status: "活跃" },
  { id: "usr_014", name: "Margaret Hamilton", email: "margaret@acme.com", role: "编辑者", status: "活跃" },
];

const profileSettings = new Map();

function publicUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
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
    const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
    if (!user || password !== (user.password ?? DEMO_PASSWORD)) return send(res, 401, { message: "邮箱或密码不正确" });
    const token = randomBytes(24).toString("hex");
    sessions.set(token, user);
    return send(
      res,
      200,
      { user: publicUser(user) },
      { "Set-Cookie": `acme_mock_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400` },
    );
  }
  if (req.method === "POST" && url.pathname === "/mock-api/auth/register") {
    const { name, email, password } = await body(req);
    if (!name || name.trim().length < 2 || !email || !password || password.length < 6) {
      return send(res, 400, { message: "请检查注册信息" });
    }
    if (users.some((item) => item.email.toLowerCase() === String(email).toLowerCase())) {
      return send(res, 409, { message: "该邮箱已注册" });
    }
    const user = {
      id: `usr_${randomBytes(6).toString("hex")}`,
      name: name.trim(),
      email: String(email).trim().toLowerCase(),
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
      password,
    };
    users.push(user);
    mockUsers.push({ id: user.id, name: user.name, email: user.email, role: "编辑者", status: "待审核" });
    const token = randomBytes(24).toString("hex");
    sessions.set(token, user);
    return send(
      res,
      201,
      { user: publicUser(user) },
      { "Set-Cookie": `acme_mock_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400` },
    );
  }
  if (req.method === "GET" && url.pathname === "/mock-api/auth/me") {
    return currentUser ? send(res, 200, { user: publicUser(currentUser) }) : send(res, 401, { message: "未登录" });
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
  if (url.pathname === "/mock-api/profile/settings" && ["GET", "PUT"].includes(req.method)) {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    if (req.method === "GET") {
      return send(
        res,
        200,
        profileSettings.get(currentUser.id) ?? {
          orderNotifications: true,
          memberNotifications: true,
          weeklySummary: false,
        },
      );
    }
    const settings = await body(req);
    const next = {
      orderNotifications: Boolean(settings.orderNotifications),
      memberNotifications: Boolean(settings.memberNotifications),
      weeklySummary: Boolean(settings.weeklySummary),
    };
    profileSettings.set(currentUser.id, next);
    return send(res, 200, next);
  }
  if (req.method === "PUT" && url.pathname === "/mock-api/profile") {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    const input = await body(req);
    if (!input.name || String(input.name).trim().length < 2)
      return send(res, 400, { message: "姓名至少需要 2 个字符" });
    currentUser.name = String(input.name).trim();
    return send(res, 200, { user: publicUser(currentUser) });
  }
  if (["GET", "POST"].includes(req.method) && url.pathname === "/mock-api/users") {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    const requiredPermission = req.method === "POST" ? "app:user:add" : "app:user:list";
    if (!currentUser.permissions.includes("*") && !currentUser.permissions.includes(requiredPermission)) {
      return send(res, 403, { message: "没有用户管理权限" });
    }
    if (req.method === "POST") {
      const input = await body(req);
      if (!input.name || !input.email || !input.role || !input.status)
        return send(res, 400, { message: "请填写完整用户信息" });
      if (mockUsers.some((item) => item.email.toLowerCase() === String(input.email).toLowerCase())) {
        return send(res, 409, { message: "该邮箱已存在" });
      }
      const user = {
        id: `usr_${randomBytes(6).toString("hex")}`,
        name: String(input.name).trim(),
        email: String(input.email).trim().toLowerCase(),
        role: input.role === "admin" ? "管理员" : "编辑者",
        status: input.status,
      };
      mockUsers.push(user);
      return send(res, 201, { user });
    }
    const searchParams = url.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 10) || 10));
    const keyword = (searchParams.get("keyword") ?? "").trim().toLowerCase();
    const filtered = mockUsers.filter(
      (user) => !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword),
    );
    const start = (page - 1) * pageSize;
    return send(res, 200, {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    });
  }
  const userMatch = url.pathname.match(/^\/mock-api\/users\/([^/]+)$/);
  if (userMatch && ["PUT", "DELETE"].includes(req.method)) {
    if (!currentUser) return send(res, 401, { message: "未登录" });
    if (!currentUser.permissions.includes("*")) return send(res, 403, { message: "没有用户管理权限" });
    const index = mockUsers.findIndex((item) => item.id === decodeURIComponent(userMatch[1]));
    if (index < 0) return send(res, 404, { message: "用户不存在" });
    if (req.method === "DELETE") {
      if (mockUsers[index].id === currentUser.id) return send(res, 400, { message: "不能删除当前登录用户" });
      mockUsers.splice(index, 1);
      return send(res, 200, { ok: true });
    }
    const input = await body(req);
    if (
      input.email &&
      mockUsers.some(
        (item, itemIndex) => itemIndex !== index && item.email.toLowerCase() === String(input.email).toLowerCase(),
      )
    ) {
      return send(res, 409, { message: "该邮箱已存在" });
    }
    mockUsers[index] = {
      ...mockUsers[index],
      ...(input.name ? { name: String(input.name).trim() } : {}),
      ...(input.email ? { email: String(input.email).trim().toLowerCase() } : {}),
      ...(input.role ? { role: input.role === "admin" ? "管理员" : "编辑者" } : {}),
      ...(input.status ? { status: input.status } : {}),
    };
    return send(res, 200, { user: mockUsers[index] });
  }
  return send(res, 404, { message: "Mock API route not found" });
});

server.listen(port, () => console.log(`[Mock API] listening on http://localhost:${port}`));
