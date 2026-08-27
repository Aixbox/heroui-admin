import { redirect } from "react-router";
import { mockApi, type User } from "./mock-api";

export async function requireUser(request: Request): Promise<User> {
  try {
    const result = await mockApi.me({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
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
