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

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return process.env.API_URL ?? "http://localhost:8787";
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    throw Object.assign(new Error(error.message || "请求失败"), error);
  }

  return response.json() as Promise<T>;
}

export const api = {
  me: (requestInit?: RequestInit) => request<{ user: User }>("/api/auth/me", requestInit),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  stats: (requestInit?: RequestInit) => request<DashboardStats>("/api/dashboard/stats", requestInit),
};
