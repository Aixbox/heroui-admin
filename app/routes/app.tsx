import { Button, Link, Separator } from "@heroui/react";
import { useEffect } from "react";
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { mockApi } from "~/lib/mock-api";
import { requireUser } from "~/lib/auth";
import { useAuthStore } from "~/stores/auth";
import { AppIcon } from "~/components/app-icon";

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

  const links = [
    { href: "/app", label: "概览", icon: "dashboard" as const, end: true },
    { href: "/app/users", label: "用户管理", icon: "users" as const },
    { href: "/app/settings", label: "系统设置", icon: "settings" as const },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-separator bg-surface/60 px-4 py-5 lg:flex lg:flex-col">
        <Link className="mb-8 flex items-center gap-3 px-3 text-foreground no-underline" href="/app">
          <span className="grid size-9 place-items-center rounded-xl bg-accent font-bold text-accent-foreground">A</span>
          <span><strong className="block">Acme Admin</strong><small className="text-muted">运营控制台</small></span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted">工作区</p>
          {links.map((item) => <NavLink key={item.href} end={item.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm no-underline transition ${isActive ? "bg-accent/12 font-medium text-accent" : "text-muted hover:bg-surface-secondary hover:text-foreground"}`} to={item.href}><AppIcon className="size-4" name={item.icon} />{item.label}</NavLink>)}
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
