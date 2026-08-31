export interface ApiErrorPayload {
  message: string;
  fieldErrors?: Record<string, string>;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  code?: string;

  constructor(status: number, payload: Partial<ApiErrorPayload>) {
    super(payload.message || "请求失败");
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = payload.fieldErrors;
    this.code = payload.code;
  }
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") return import.meta.env.VITE_API_BASE_URL ?? "";
  return process.env.API_BASE_URL ?? process.env.MOCK_API_URL ?? "http://localhost:8787";
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?redirectTo=${redirectTo}`);
    }
    const payload = (await response.json().catch(() => ({}))) as Partial<ApiErrorPayload>;
    throw new ApiError(response.status, payload);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
