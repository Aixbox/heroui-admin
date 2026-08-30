// Mock API server — 仅用于本地联调，后续不会作为正式后端部署。
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const port = Number(process.env.MOCK_API_PORT ?? 8787);
const sessions = new Map();
const demoUser = { id: "usr_001", name: "Ada Lovelace", email: "admin@acme.com", role: "admin" };

function send(res, status, data, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json", "X-Mock-Api": "true", ...extraHeaders });
  res.end(JSON.stringify(data));
}
function cookieValue(req, name) { return req.headers.cookie?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.split("=")[1]; }
function cors(req, res) { const origin = req.headers.origin; if (origin) res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Access-Control-Allow-Credentials", "true"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); }
async function body(req) { let raw = ""; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; }

const server = createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = cookieValue(req, "acme_mock_session");
  if (req.method === "GET" && url.pathname === "/mock-api/health") return send(res, 200, { ok: true, mock: true });
  if (req.method === "POST" && url.pathname === "/mock-api/auth/login") {
    const { email, password } = await body(req);
    if (email !== demoUser.email || password !== "acme-demo-7Kx92m") return send(res, 401, { message: "邮箱或密码不正确" });
    const token = randomBytes(24).toString("hex"); sessions.set(token, demoUser);
    return send(res, 200, { user: demoUser }, { "Set-Cookie": `acme_mock_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400` });
  }
  if (req.method === "GET" && url.pathname === "/mock-api/auth/me") { const user = sessionId && sessions.get(sessionId); return user ? send(res, 200, { user }) : send(res, 401, { message: "未登录" }); }
  if (req.method === "POST" && url.pathname === "/mock-api/auth/logout") { if (sessionId) sessions.delete(sessionId); return send(res, 200, { ok: true }, { "Set-Cookie": "acme_mock_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0" }); }
  if (req.method === "GET" && url.pathname === "/mock-api/dashboard/stats") { if (!sessionId || !sessions.has(sessionId)) return send(res, 401, { message: "未登录" }); return send(res, 200, { revenue: "¥128,430", orders: 1248, customers: 8420, conversion: "12.8%" }); }
  return send(res, 404, { message: "Mock API route not found" });
});

server.listen(port, () => console.log(`[Mock API] listening on http://localhost:${port}`));
