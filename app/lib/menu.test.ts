import { describe, expect, it } from "vitest";
import { findMenuTrail, toNavItems } from "~/lib/menu";
import type { MenuNode } from "~/lib/mock-api";

const tree: MenuNode[] = [
  { key: "overview", label: "概览", icon: "dashboard", href: "/app", end: true },
  {
    key: "system",
    label: "系统管理",
    icon: "settings",
    children: [{ key: "system-users", label: "用户管理", icon: "users", href: "/app/users" }],
  },
];

describe("toNavItems", () => {
  it("递归转换菜单树并保留 end 标记与图标", () => {
    const items = toNavItems(tree);
    expect(items[0]).toMatchObject({ label: "概览", href: "/app", end: true, icon: "dashboard" });
    expect(items[1].label).toBe("系统管理");
    expect(items[1].children?.[0]).toMatchObject({ label: "用户管理", href: "/app/users" });
  });
});

describe("findMenuTrail", () => {
  it("返回当前路径的层级链", () => {
    expect(findMenuTrail(tree, "/app/users")).toEqual(["系统管理", "用户管理"]);
  });

  it("end 叶子只做精确匹配，避免 /app 前缀误命中子路由", () => {
    expect(findMenuTrail(tree, "/app")).toEqual(["概览"]);
    expect(findMenuTrail(tree, "/app/users")).not.toContain("概览");
  });

  it("未命中时返回 null", () => {
    expect(findMenuTrail(tree, "/app/unknown")).toBeNull();
  });
});
