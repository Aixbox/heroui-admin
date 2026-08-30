export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface DashboardStats {
  revenue: string;
  orders: number;
  customers: number;
  conversion: string;
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
    const error = (await response.json().catch(() => ({}))) as MockApiError;
    throw Object.assign(new Error(error.message || "Mock 请求失败"), error);
  }
  return response.json() as Promise<T>;
}

/** 仅用于本地联调。接入正式后端时请替换此模块，不要复用 Mock 接口契约。 */
export const mockApi = {
  me: (requestInit?: RequestInit) => mockRequest<{ user: User }>("/mock-api/auth/me", requestInit),
  login: (email: string, password: string) =>
    mockRequest<{ user: User }>("/mock-api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => mockRequest<{ ok: true }>("/mock-api/auth/logout", { method: "POST" }),
  stats: (requestInit?: RequestInit) => mockRequest<DashboardStats>("/mock-api/dashboard/stats", requestInit),
};
