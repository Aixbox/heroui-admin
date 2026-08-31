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

export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  status: "活跃" | "待审核" | "停用";
}

export interface UserSettings {
  orderNotifications: boolean;
  memberNotifications: boolean;
  weeklySummary: boolean;
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
/** 仅用于本地联调。接入正式后端时请替换此模块，不要复用 Mock 接口契约。 */
export const mockApi = {
  me: (requestInit?: RequestInit) => apiRequest<{ user: User }>("/mock-api/auth/me", requestInit),
  /** 后端按角色过滤后的菜单树 */
  menus: (requestInit?: RequestInit) => apiRequest<{ menus: MenuNode[] }>("/mock-api/auth/menus", requestInit),
  login: (email: string, password: string) =>
    apiRequest<{ user: User }>("/mock-api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (input: { name: string; email: string; password: string }) =>
    apiRequest<{ user: User }>("/mock-api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  logout: () => apiRequest<{ ok: true }>("/mock-api/auth/logout", { method: "POST" }),
  stats: (requestInit?: RequestInit) => apiRequest<DashboardStats>("/mock-api/dashboard/stats", requestInit),
  users: (params: PageQuery = {}, requestInit?: RequestInit) => {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 10),
    });
    if (params.keyword) search.set("keyword", params.keyword);
    return apiRequest<PageResult<UserListItem>>(`/mock-api/users?${search.toString()}`, requestInit);
  },
  createUser: (input: UserInput) =>
    apiRequest<{ user: UserListItem }>("/mock-api/users", { method: "POST", body: JSON.stringify(input) }),
  updateUser: (id: string, input: Partial<UserInput>) =>
    apiRequest<{ user: UserListItem }>(`/mock-api/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteUser: (id: string) =>
    apiRequest<{ ok: true }>(`/mock-api/users/${encodeURIComponent(id)}`, { method: "DELETE" }),
  settings: (requestInit?: RequestInit) => apiRequest<UserSettings>("/mock-api/profile/settings", requestInit),
  updateSettings: (settings: UserSettings) =>
    apiRequest<UserSettings>("/mock-api/profile/settings", { method: "PUT", body: JSON.stringify(settings) }),
  updateProfile: (input: { name: string }) =>
    apiRequest<{ user: User }>("/mock-api/profile", { method: "PUT", body: JSON.stringify(input) }),
};
import { apiRequest } from "./api-client";
