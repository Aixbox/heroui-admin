export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** 角色编码列表，如 ["admin"] */
  roles: string[];
  /** 权限码列表（"模块:资源:操作"），"*" 为全通配 */
  permissions: string[];
}

/** 后端下发的菜单节点；label 为中文原文，i18n 未收录时回退原文 */
export interface MenuNode {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  /** 无子级且路径为其他路由前缀时（如 /app）需精确匹配高亮 */
  end?: boolean;
  children?: MenuNode[];
}

export interface DashboardStats {
  revenue: string;
  orders: number;
  customers: number;
  conversion: string;
}

/** 用户列表行（管理页表格用，与登录态 User 是不同契约） */
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

/** 通用分页查询参数与结果（所有列表类接口统一契约） */
export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface MockApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

const getMockApiBaseUrl = () =>
  typeof window !== "undefined" ? "" : (process.env.MOCK_API_URL ?? "http://localhost:8787");

async function mockRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getMockApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    // 浏览器端会话失效：全局跳转登录页（服务端由 loader 里的 requireUser 负责重定向）
    if (response.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?redirectTo=${redirectTo}`);
    }
    const error = (await response.json().catch(() => ({}))) as MockApiError;
    throw Object.assign(new Error(error.message || "Mock 请求失败"), error);
  }
  return response.json() as Promise<T>;
}

/** 仅用于本地联调。接入正式后端时请替换此模块，不要复用 Mock 接口契约。 */
export const mockApi = {
  me: (requestInit?: RequestInit) => mockRequest<{ user: User }>("/mock-api/auth/me", requestInit),
  /** 后端按角色过滤后的菜单树 */
  menus: (requestInit?: RequestInit) => mockRequest<{ menus: MenuNode[] }>("/mock-api/auth/menus", requestInit),
  login: (email: string, password: string) =>
    mockRequest<{ user: User }>("/mock-api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => mockRequest<{ ok: true }>("/mock-api/auth/logout", { method: "POST" }),
  stats: (requestInit?: RequestInit) => mockRequest<DashboardStats>("/mock-api/dashboard/stats", requestInit),
  users: (params: PageQuery = {}, requestInit?: RequestInit) => {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
    });
    if (params.keyword) search.set("keyword", params.keyword);
    return mockRequest<PageResult<UserListItem>>(`/mock-api/users?${search.toString()}`, requestInit);
  },
};
