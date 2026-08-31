import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Spinner, Switch, toast } from "@heroui/react";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";
import { mockApi, type UserSettings } from "~/lib/mock-api";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

const defaultSettings: UserSettings = { orderNotifications: true, memberNotifications: true, weeklySummary: false };

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["profile-settings"], queryFn: () => mockApi.settings() });
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (query.data && !initialized) {
      setSettings(query.data);
      setInitialized(true);
    }
  }, [initialized, query.data]);
  const mutation = useMutation({
    mutationFn: () => mockApi.updateSettings(settings),
    onSuccess: async (next) => {
      setSettings(next);
      await queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
      toast.success("设置已保存");
    },
    onError: (error) => toast.danger(error instanceof Error ? error.message : "保存失败"),
  });
  const items: Array<{ key: keyof UserSettings; label: string; description: string }> = [
    { key: "orderNotifications", label: "订单状态变化", description: "通过邮件发送订单状态通知" },
    { key: "memberNotifications", label: "新成员加入", description: "有新成员加入工作区时通知" },
    { key: "weeklySummary", label: "每周业务摘要", description: "每周一发送业务数据摘要" },
  ];

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
          {query.isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner size="sm" />
              加载设置中…
            </div>
          ) : (
            items.map((item) => (
              <div className="flex items-center justify-between gap-4" key={item.key}>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                <Switch
                  isSelected={settings[item.key]}
                  aria-label={item.label}
                  onChange={(value) => setSettings((current) => ({ ...current, [item.key]: value }))}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </div>
            ))
          )}
        </Card.Content>
        <Card.Footer>
          <Button isPending={mutation.isPending} variant="primary" onPress={() => mutation.mutate()}>
            保存设置
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
