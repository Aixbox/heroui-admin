import type { LoaderFunctionArgs } from "react-router";
import { ExceptionPage } from "~/components/exception-page";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function ForbiddenExamplePage() {
  return (
    <ExceptionPage code="403" title="没有访问权限" description="当前账号没有访问该页面的权限，请联系管理员开通。" />
  );
}
