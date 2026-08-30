import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  Link,
  useRouteError,
} from "react-router";
import type { LinksFunction } from "react-router";

import { AppProviders } from "./providers";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;800;900&display=swap",
  },
  { rel: "icon", href: "/logo.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-vibrant-palette="true">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

/** 根级错误边界：未捕获的路由错误 / 404 / 500 统一渲染，样式与异常页演示一致 */
export function ErrorBoundary() {
  const error = useRouteError();
  const isResponse = isRouteErrorResponse(error);
  const status = isResponse ? error.status : 500;
  const title = isResponse ? (status === 404 ? "页面不存在" : "请求出错") : "服务器开小差了";
  const description = isResponse
    ? status === 404
      ? "你访问的页面可能已被移除、重命名或暂时不可用。"
      : typeof error.data === "string" && error.data
        ? error.data
        : "请求处理出现问题，请稍后重试。"
    : "应用发生了意外错误，请刷新重试或返回首页。";

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
      <div className="flex flex-col items-center gap-4">
        <p className="text-8xl font-bold tracking-tighter text-accent/30">{status}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-md text-muted">{description}</p>
        <div className="mt-2 flex gap-3">
          <Link
            to="/app"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground no-underline"
          >
            返回概览
          </Link>
          <Link to="/login" className="rounded-lg border border-separator px-4 py-2 text-sm no-underline">
            前往登录
          </Link>
        </div>
      </div>
    </div>
  );
}
