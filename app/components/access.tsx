import type { ReactNode } from "react";
import { usePermission } from "~/hooks/use-permission";

type AccessProps = {
  /** 需要的权限码（"模块:资源:操作"），不传则不校验权限 */
  permission?: string;
  /** 需要的角色编码，不传则不校验角色 */
  role?: string;
  /** 无权限时渲染的内容，默认不渲染 */
  fallback?: ReactNode;
  children: ReactNode;
};

/** 按钮级权限守卫：权限码/角色不满足时不渲染子内容 */
export function Access({ permission, role, fallback = null, children }: AccessProps) {
  const { hasPermi, hasRole } = usePermission();
  const allowed = (permission ? hasPermi(permission) : true) && (role ? hasRole(role) : true);
  return <>{allowed ? children : fallback}</>;
}
