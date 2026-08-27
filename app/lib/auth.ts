import { redirect } from "react-router";
import { api, type User } from "./api";

export async function requireUser(request: Request): Promise<User> {
  try {
    const result = await api.me({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
    return result.user;
  } catch {
    throw redirect(`/login?redirectTo=${encodeURIComponent(new URL(request.url).pathname)}`);
  }
}

export async function requireRole(request: Request, role: User["role"]): Promise<User> {
  const user = await requireUser(request);
  if (user.role !== role) throw new Response("无权访问此页面", { status: 403 });
  return user;
}
