import { Avatar, Badge, Breadcrumbs, Button, Drawer, Link, Popover, useOverlayState, useTheme } from "@heroui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { mockApi } from "~/lib/mock-api";
import { findMenuTrail, toNavItems, type TabItem } from "~/lib/menu";
import { requireUser } from "~/lib/auth";
import { useAuthStore } from "~/stores/auth";
import { AppIcon } from "~/components/app-icon";
import { CommandPalette } from "~/components/command-palette";
import { SidebarNavigation } from "~/components/sidebar-navigation";
import { useT } from "~/lib/i18n";
import { useUiStore } from "~/stores/ui";

export const meta: MetaFunction = () => [{ title: "Acme Admin" }];

const initialNotifications = [
  { id: 1, title: "新用户注册：sarah@example.com", time: "10 分钟前", unread: true },
  { id: 2, title: "订单 #10482 已完成支付", time: "1 小时前", unread: true },
  { id: 3, title: "系统设置已更新", time: "昨天 14:20", unread: false },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { menus } = await mockApi.menus({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
  return { user, menus };
}

export default function AppLayout() {
  const { user, menus } = useLoaderData<typeof loader>();
  const setUser = useAuthStore((state) => state.setUser);
  const navigationItems = useMemo(() => toNavItems(menus), [menus]);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifState = useOverlayState();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabs, setTabs] = useState<TabItem[]>(() => [{ path: "/app", label: "概览" }]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { resolvedTheme, setTheme } = useTheme("system");
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);
  const t = useT();
  useEffect(() => setUser(user), [setUser, user]);
  const handleLogout = async () => {
    await mockApi.logout();
    navigate("/login", { replace: true });
  };
  // 与登录页一致：切换主题用 View Transition 包裹，保留 Polygon 主题切换动画
  const toggleTheme = (theme: "light" | "dark") => {
    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.dataset.theme = theme;
      setTheme(theme);
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    document.startViewTransition(applyTheme);
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  const unreadCount = notifications.filter((item) => item.unread).length;
  const markAllRead = () => setNotifications((list) => list.map((item) => ({ ...item, unread: false })));

  // 通知面板：悬停铃铛或面板时保持打开，移出 150ms 后关闭（定时器用于跨越两者间隙时不闪烁）
  const notifCloseTimer = useRef<number | null>(null);
  const openNotifications = () => {
    if (notifCloseTimer.current) window.clearTimeout(notifCloseTimer.current);
    notifState.open();
  };
  const scheduleCloseNotifications = () => {
    notifCloseTimer.current = window.setTimeout(() => notifState.close(), 150);
  };
  useEffect(() => {
    return () => {
      if (notifCloseTimer.current) window.clearTimeout(notifCloseTimer.current);
    };
  }, []);

  // 面包屑：由菜单树推导当前路径链，未命中回退「概览」
  const trail = useMemo(
    () => findMenuTrail(navigationItems, location.pathname) ?? ["概览"],
    [location.pathname, navigationItems],
  );

  // 多标签页：进入新路由时记录页签；关闭当前页签时回退到相邻页签（概览页签固定）
  useEffect(() => {
    const label = trail[trail.length - 1] ?? "概览";
    setTabs((prev) =>
      prev.some((tab) => tab.path === location.pathname) ? prev : [...prev, { path: location.pathname, label }],
    );
  }, [location.pathname, trail]);
  const closeTab = (path: string) => {
    setTabs((prevTabs) => {
      const index = prevTabs.findIndex((tab) => tab.path === path);
      const next = prevTabs.filter((tab) => tab.path !== path);
      if (path === location.pathname) {
        const fallback = next[Math.max(0, index - 1)] ?? next[0];
        if (fallback) navigate(fallback.path);
      }
      return next;
    });
  };

  // 恢复本地保存的界面偏好；SSR 首帧保持默认值，挂载后再同步，避免水合不一致
  useEffect(() => {
    setCollapsed(localStorage.getItem("acme.sidebar.collapsed") === "1");
    setFullWidth(localStorage.getItem("acme.content.fullWidth") === "1");
    const savedLocale = localStorage.getItem("acme.locale");
    if (savedLocale === "zh" || savedLocale === "en") setLocale(savedLocale);
  }, [setLocale]);
  useEffect(() => {
    localStorage.setItem("acme.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem("acme.content.fullWidth", fullWidth ? "1" : "0");
  }, [fullWidth]);

  // Ctrl/Cmd + K 打开全局搜索
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-separator bg-surface/60 pr-4 pl-3 backdrop-blur-lg sm:pr-8 sm:pl-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              isIconOnly
              aria-label={t("打开菜单")}
              className="lg:hidden"
              size="sm"
              variant="ghost"
              onPress={() => setMobileOpen(true)}
            >
              <AppIcon className="size-4" name="menu" />
            </Button>
            <Button
              isIconOnly
              aria-label={collapsed ? t("展开侧边栏") : t("收起侧边栏")}
              className="hidden lg:inline-flex"
              size="sm"
              variant="ghost"
              onPress={() => setCollapsed((value) => !value)}
            >
              <AppIcon className="size-4" name={collapsed ? "panelOpen" : "panelClose"} />
            </Button>
            <Breadcrumbs aria-label={t("面包屑")} className="min-w-0">
              {trail.map((label, index) => (
                <Breadcrumbs.Item key={`${label}-${index}`}>
                  {index === trail.length - 1 ? (
                    <span className="font-medium">{t(label)}</span>
                  ) : (
                    <span className="text-muted">{t(label)}</span>
                  )}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
          </div>
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              aria-label={isFullscreen ? t("退出全屏") : t("进入全屏")}
              size="sm"
              variant="ghost"
              onPress={toggleFullscreen}
            >
              <AppIcon className="size-4" name={isFullscreen ? "fullscreenExit" : "fullscreen"} />
            </Button>
            <Button isIconOnly aria-label={t("搜索")} size="sm" variant="ghost" onPress={() => setSearchOpen(true)}>
              <AppIcon className="size-4" name="search" />
            </Button>
            <Button
              isIconOnly
              aria-label={fullWidth ? t("切换为定宽") : t("切换为全宽")}
              size="sm"
              variant="ghost"
              onPress={() => setFullWidth((value) => !value)}
            >
              <AppIcon className="size-4" name={fullWidth ? "widthFixed" : "widthFull"} />
            </Button>
            <Button
              isIconOnly
              aria-label={resolvedTheme === "dark" ? t("切换到浅色模式") : t("切换到深色模式")}
              size="sm"
              variant="ghost"
              onPress={() => toggleTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <AppIcon className="size-4" name={resolvedTheme === "dark" ? "sun" : "moon"} />
            </Button>
            <Button
              aria-label={locale === "zh" ? t("切换到英文") : t("切换到中文")}
              className="px-2.5 text-xs font-semibold"
              size="sm"
              variant="ghost"
              onPress={() => setLocale(locale === "zh" ? "en" : "zh")}
            >
              {locale === "zh" ? "EN" : "中"}
            </Button>
            <Popover>
              <Badge.Anchor onPointerEnter={openNotifications} onPointerLeave={scheduleCloseNotifications}>
                <Button isIconOnly aria-label={t("通知")} size="sm" variant="ghost" onPress={() => notifState.toggle()}>
                  <AppIcon className="size-4" name="bell" />
                </Button>
                {unreadCount > 0 && (
                  <Badge
                    className="semantic-status-badge"
                    color="danger"
                    placement="top-right"
                    size="sm"
                    variant="soft"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Badge.Anchor>
              {/* 受控属性放在 Content 上（对应官方 Modal.Backdrop 的受控模式）；isNonModal 关闭
                  RAC Popover 默认的模态行为（滚动锁定 + 遮挡页面交互），否则悬停打开会引发
                  「滚动条消失 → 布局横移 → 鼠标脱离按钮 → 关闭」的死循环 */}
              <Popover.Content
                isNonModal
                isOpen={notifState.isOpen}
                onOpenChange={notifState.setOpen}
                placement="bottom end"
                offset={8}
              >
                <div
                  className="w-80 rounded-xl border border-separator bg-surface p-2 shadow-lg"
                  onPointerEnter={openNotifications}
                  onPointerLeave={scheduleCloseNotifications}
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-sm font-semibold">{t("通知")}</p>
                    <Button isDisabled={unreadCount === 0} size="sm" variant="ghost" onPress={markAllRead}>
                      {t("全部已读")}
                    </Button>
                  </div>
                  <div className="flex flex-col">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-surface-secondary"
                      >
                        <span
                          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.unread ? "bg-accent" : "bg-transparent"}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm">{item.title}</p>
                          <p className="text-xs text-muted">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Content>
            </Popover>
            <div className="group relative flex items-center">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5 text-left transition hover:bg-surface-secondary"
              >
                <Avatar className="size-9 shrink-0">
                  <Avatar.Fallback className="bg-accent/15 text-sm font-semibold text-accent">
                    {user.name.slice(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
              </button>
              {/* 悬停/聚焦用户区域弹出的信息卡片；卡片是 group 子元素，指针移入卡片不会中断悬停，pt-2 作为过渡桥 */}
              <div className="pointer-events-none invisible absolute top-full right-0 z-20 translate-y-1 pt-2 opacity-0 transition-all duration-150 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="w-64 rounded-xl border border-separator bg-surface p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                      <Avatar.Fallback className="bg-accent/15 text-sm font-semibold text-accent">
                        {user.name.slice(0, 1)}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1" size="sm" variant="outline" onPress={() => navigate("/app/settings")}>
                      {t("个人设置")}
                    </Button>
                    <Button className="flex-1" size="sm" variant="danger" onPress={handleLogout}>
                      {t("退出登录")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* 多标签页栏：记录访问过的页面，点击切换、悬停出现关闭按钮；概览页签固定 */}
        <div className="sticky top-14 z-10 flex items-center gap-0 overflow-x-auto border-b border-separator bg-surface/60 px-3 py-1 backdrop-blur-lg sm:px-4">
          {tabs.map((tab, index) => {
            const isActive = tab.path === location.pathname;
            return (
              <Fragment key={tab.path}>
                {index > 0 && (
                  <svg
                    aria-hidden="true"
                    className="mx-1 h-5 w-px shrink-0 self-center text-separator"
                    shapeRendering="crispEdges"
                    viewBox="0 0 1 20"
                  >
                    <rect width="1" height="20" fill="currentColor" />
                  </svg>
                )}
                <div
                  className={`group flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm transition ${
                    isActive
                      ? "bg-accent/12 font-medium text-accent"
                      : "text-muted hover:bg-surface-secondary hover:text-foreground"
                  }`}
                >
                  <button type="button" className="cursor-pointer" onClick={() => navigate(tab.path)}>
                    {t(tab.label)}
                  </button>
                  {tab.path !== "/app" && (
                    <button
                      type="button"
                      aria-label={`${t("关闭标签页")} ${t(tab.label)}`}
                      className={`cursor-pointer rounded transition hover:bg-default ${
                        isActive ? "opacity-70" : "opacity-0 group-hover:opacity-70"
                      }`}
                      onClick={() => closeTab(tab.path)}
                    >
                      <AppIcon className="size-3" name="close" />
                    </button>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
        <main className={fullWidth ? "p-4 sm:p-8" : "mx-auto max-w-7xl p-4 sm:p-8"}>
          <Outlet />
        </main>
      </div>
      <Drawer isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Acme Admin</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <nav className="flex flex-col gap-1 pb-2">
                  <SidebarNavigation
                    items={navigationItems}
                    onNavigate={() => setMobileOpen(false)}
                    pathname={location.pathname}
                  />
                </nav>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
      <CommandPalette items={navigationItems} isOpen={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
