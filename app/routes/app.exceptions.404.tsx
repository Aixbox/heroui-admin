import type { LoaderFunctionArgs } from "react-router";
import { ExceptionPage } from "~/components/exception-page";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function NotFoundExamplePage() {
  return <ExceptionPage code="404" title="页面不存在" description="你访问的页面可能已被移除、重命名或暂时不可用。" />;
}
