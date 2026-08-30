import { useAuthStore } from "~/stores/auth";

/**
 * 按钮级权限：基于登录时后端下发的权限码（"模块:资源:操作"）。
 * "*" 为全通配（管理员）。与后端 requirePermi 使用同一套权限码。
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const hasPermi = (code: string) => {
    const permissions = user?.permissions ?? [];
    return permissions.includes("*") || permissions.includes(code);
  };

  const hasRole = (role: string) => (user?.roles ?? []).includes(role);

  return { hasPermi, hasRole };
}
