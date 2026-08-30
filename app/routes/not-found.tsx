import { ExceptionPage } from "~/components/exception-page";

/** 公共兜底路由：未匹配任何路径时渲染（不要求登录） */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExceptionPage code="404" title="页面不存在" description="你访问的页面可能已被移除、重命名或暂时不可用。" />
    </div>
  );
}
