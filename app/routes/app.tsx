import { Button, Link } from "@heroui/react";
import { useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
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
    children: [{ href: "/app/users", label: "用户管理" }],
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
            children: [{ href: "/app/settings", label: "通知设置" }],
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
            children: [{ href: "/app/analytics", label: "趋势分析" }],
          },
        ],
      },
      {
        label: "报表中心",
        icon: "configuration",
        children: [{ href: "/app/reports", label: "销售报表" }],
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
            children: [{ href: "/app/reports", label: "运行详情", icon: "users" }],
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
                        children: [{ href: "/app/pattern-a", label: "第 7 级 · 有", icon: "users" }],
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
                children: [{ href: "/app/pattern-b", label: "第 5 级 · 无" }],
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
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setUser(user), [setUser, user]);
  const handleLogout = async () => {
    await mockApi.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className="fixed inset-y-0 left-0 z-20 hidden overflow-hidden border-r border-separator bg-surface/60 lg:flex lg:flex-col"
        style={{ width: collapsed ? 64 : 256, transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* 内层宽度直接切到目标值、外层宽度做过渡，避免过渡期间内容被挤压变形；keyed 重挂载配合 animate-in 做内容淡入 */}
        <div
          key={collapsed ? "collapsed" : "expanded"}
          className={`flex flex-1 animate-in flex-col py-5 duration-200 fade-in ${collapsed ? "w-16 px-2" : "w-64 px-2"}`}
        >
          <Link
            className={`mb-8 flex items-center gap-3 text-foreground no-underline ${collapsed ? "justify-center px-0" : "px-3"}`}
            href="/app"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <img alt="Acme Admin" className="size-6 object-contain brightness-0 invert" src="/logo.svg" />
            </span>
            {!collapsed && (
              <span>
                <strong className="block">Acme Admin</strong>
                <small className="text-muted">运营控制台</small>
              </span>
            )}
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            <SidebarNavigation collapsed={collapsed} items={navigationItems} pathname={location.pathname} />
          </nav>
        </div>
      </aside>
      <div
        className={collapsed ? "lg:pl-16" : "lg:pl-64"}
        style={{ transition: "padding-left 280ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-separator bg-background/80 pr-4 pl-3 backdrop-blur-lg sm:pr-8 sm:pl-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              isIconOnly
              aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
              className="hidden lg:inline-flex"
              size="sm"
              variant="ghost"
              onPress={() => setCollapsed((value) => !value)}
            >
              <AppIcon className="size-4" name={collapsed ? "panelOpen" : "panelClose"} />
            </Button>
            <h1 className="truncate text-lg font-semibold">欢迎回来，{user.name.split(" ")[0]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success sm:inline">
              系统运行正常
            </span>
            <div className="grid size-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {user.name.slice(0, 1)}
            </div>
            <Button isIconOnly aria-label="退出登录" size="sm" variant="ghost" onPress={handleLogout}>
              <AppIcon className="size-4" name="logout" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
