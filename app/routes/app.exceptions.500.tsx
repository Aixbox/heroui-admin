import type { LoaderFunctionArgs } from "react-router";
import { ExceptionPage } from "~/components/exception-page";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function ServerErrorExamplePage() {
  return (
    <ExceptionPage code="500" title="服务器开小差了" description="服务器遇到了未知错误，请稍后重试或联系技术支持。" />
  );
}
