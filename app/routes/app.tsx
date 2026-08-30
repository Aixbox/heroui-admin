import { Button, Link, Separator } from "@heroui/react";
import { useEffect } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { mockApi } from "~/lib/mock-api";
import { requireUser } from "~/lib/auth";
import { useAuthStore } from "~/stores/auth";
import { AppIcon } from "~/components/app-icon";
import { SidebarNavigation, type SidebarNavigationItem } from "~/components/sidebar-navigation";

const navigationItems: SidebarNavigationItem[] = [
  { href: "/app", label: "概览", icon: "dashboard", end: true },
  {
    label: "用户与权限",
    icon: "users",
    children: [
      { href: "/app/users", label: "用户管理" },
    ],
  },
  {
    label: "系统管理",
    icon: "settings",
    children: [
      {
        label: "配置中心",
        children: [
          {
            label: "系统设置",
            children: [
              { href: "/app/settings", label: "通知设置" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "分析中心",
    icon: "analytics",
    children: [
      {
        label: "数据分析",
        children: [
          {
            label: "指标配置",
            icon: "configuration",
            children: [
              { href: "/app/analytics", label: "趋势分析" },
            ],
          },
        ],
      },
      {
        label: "报表中心",
        icon: "configuration",
        children: [
          { href: "/app/reports", label: "销售报表" },
        ],
      },
    ],
  },
  {
    label: "系统工具",
    icon: "settings",
    children: [
      {
        label: "任务中心",
        icon: "analytics",
        children: [
          {
            label: "执行记录",
            icon: "configuration",
            children: [
              { href: "/app/reports", label: "运行详情", icon: "users" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "测试链 A · 有无无有有无有",
    icon: "settings",
    children: [
      {
        label: "第 2 级 · 无",
        children: [
          {
            label: "第 3 级 · 无",
            children: [
              {
                label: "第 4 级 · 有",
                icon: "analytics",
                children: [
                  {
                    label: "第 5 级 · 有",
                    icon: "configuration",
                    children: [
                      {
                        label: "第 6 级 · 无",
                        children: [
                          { href: "/app/pattern-a", label: "第 7 级 · 有", icon: "users" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "测试链 B · 无有有无无",
    children: [
      {
        label: "第 2 级 · 有",
        icon: "users",
        children: [
          {
            label: "第 3 级 · 有",
            icon: "analytics",
            children: [
              {
                label: "第 4 级 · 无",
                children: [
                  { href: "/app/pattern-b", label: "第 5 级 · 无" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const meta: MetaFunction = () => [{ title: "Acme Admin" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setUser(user), [setUser, user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-separator bg-surface/60 px-2 py-5 lg:flex lg:flex-col">
        <Link className="mb-8 flex items-center gap-3 px-3 text-foreground no-underline" href="/app">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><img alt="Acme Admin" className="size-6 object-contain brightness-0 invert" src="/logo.svg" /></span>
          <span><strong className="block">Acme Admin</strong><small className="text-muted">运营控制台</small></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <SidebarNavigation items={navigationItems} pathname={location.pathname} />
        </nav>
        <Separator className="my-4" />
        <div className="flex items-center gap-3 px-3 py-2"><div className="grid size-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{user.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div><Button isIconOnly aria-label="退出登录" size="sm" variant="ghost" onPress={async () => { await mockApi.logout(); navigate("/login", { replace: true }); }}><AppIcon className="size-4" name="logout" /></Button></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-separator bg-background/80 px-4 backdrop-blur-lg sm:px-8"><div><p className="text-sm text-muted">{location.pathname === "/app" ? "工作区概览" : "Acme Admin"}</p><h1 className="text-lg font-semibold">欢迎回来，{user.name.split(" ")[0]}</h1></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success sm:inline">系统运行正常</span><div className="grid size-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{user.name.slice(0, 1)}</div></div></header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
