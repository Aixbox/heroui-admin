import type { SidebarNavigationItem } from "~/components/sidebar-navigation";
import type { MenuNode } from "~/lib/mock-api";

export type TabItem = { path: string; label: string };

/** 后端下发的菜单树 → 侧边栏数据；label 为中文原文（i18n 回退），icon 需与 AppIcon 图标表对齐 */
export function toNavItems(nodes: MenuNode[]): SidebarNavigationItem[] {
  return nodes.map((node) => ({
    label: node.label,
    icon: node.icon as SidebarNavigationItem["icon"],
    href: node.href,
    end: node.end,
    children: node.children ? toNavItems(node.children) : undefined,
  }));
}

/** 在菜单树中查找当前路径的层级链；未命中返回 null。end 为 true 的叶子只做精确匹配 */
export function findMenuTrail<T extends { label: string; href?: string; end?: boolean; children?: T[] }>(
  nodes: T[],
  pathname: string,
): string[] | null {
  const search = (items: T[], parents: string[]): string[] | null => {
    for (const item of items) {
      const isExact = Boolean(item.href) && pathname === item.href;
      const isPrefix = Boolean(
        item.href && !item.end && !item.children?.length && pathname.startsWith(`${item.href}/`),
      );
      if (isExact || isPrefix) return [...parents, item.label];
      if (item.children?.length) {
        const found = search(item.children, [...parents, item.label]);
        if (found) return found;
      }
    }
    return null;
  };
  return search(nodes, []);
}
