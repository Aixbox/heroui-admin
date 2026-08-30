import { Button, Card, Switch } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}
export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">个人设置</h2>
        <p className="mt-1 text-muted">管理你的个人偏好与通知选项。</p>
      </div>
      <Card className="max-w-2xl">
        <Card.Header>
          <Card.Title>通知偏好</Card.Title>
          <Card.Description>选择你希望接收的通知类型。</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-5">
          {["订单状态变化", "新成员加入", "每周业务摘要"].map((label, index) => (
            <div className="flex items-center justify-between" key={label}>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted">通过邮件发送通知</p>
              </div>
              <Switch defaultSelected={index < 2} aria-label={label}>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </div>
          ))}
        </Card.Content>
        <Card.Footer>
          <Button variant="primary">保存设置</Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
