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

/** 权限码守卫：无权限时重定向回概览（按钮级可见性用 Access 组件在页面内控制） */
export async function requirePermi(request: Request, permission: string): Promise<User> {
  const user = await requireUser(request);
  const allowed = user.permissions.includes("*") || user.permissions.includes(permission);
  if (!allowed) throw redirect("/app");
  return user;
}

export async function requireRole(request: Request, role: User["roles"][number]): Promise<User> {
  const user = await requireUser(request);
  if (!user.roles.includes(role)) throw redirect("/app");
  return user;
}
