import { Avatar, Card, Chip } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

const profile = {
  name: "Ada Lovelace",
  email: "admin@acme.com",
  role: "管理员",
  department: "研发部",
  joinedAt: "2024-06-01",
};

const activities = [
  { time: "今天 09:30", text: "更新了系统通知设置" },
  { time: "昨天 16:45", text: "导出了 6 月销售报表" },
  { time: "上周五", text: "邀请了 2 位新成员加入工作区" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">个人中心</h2>
        <p className="mt-1 text-muted">查看你的账号信息与最近动态。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-16">
              <Avatar.Fallback className="bg-accent/15 text-xl font-semibold text-accent">
                {profile.name.slice(0, 1)}
              </Avatar.Fallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{profile.name}</p>
              <p className="text-sm text-muted">{profile.email}</p>
            </div>
            <Chip variant="soft">
              <Chip.Label>{profile.role}</Chip.Label>
            </Chip>
          </Card.Content>
        </Card>
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>账号信息</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              {[
                { label: "邮箱", value: profile.email },
                { label: "部门", value: profile.department },
                { label: "加入时间", value: profile.joinedAt },
              ].map((row) => (
                <div className="flex items-center justify-between text-sm" key={row.label}>
                  <span className="text-muted">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </Card.Content>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>最近活动</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-3">
              {activities.map((activity) => (
                <div className="flex items-center justify-between gap-4 text-sm" key={activity.text}>
                  <span>{activity.text}</span>
                  <span className="shrink-0 text-xs text-muted">{activity.time}</span>
                </div>
              ))}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
