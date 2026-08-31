import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, Button, Card, Chip, FieldError, Input, Label, TextField, toast } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { requireUser } from "~/lib/auth";
import { mockApi } from "~/lib/mock-api";
import { useAuthStore } from "~/stores/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

const schema = z.object({ name: z.string().trim().min(2, "姓名至少需要 2 个字符") });
type ProfileValues = z.infer<typeof schema>;

const activities = [
  { time: "今天 09:30", text: "更新了系统通知设置" },
  { time: "昨天 16:45", text: "登录了管理控制台" },
  { time: "上周五", text: "查看了用户列表" },
];

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const currentUser = useAuthStore((state) => state.user) ?? user;
  const setUser = useAuthStore((state) => state.setUser);
  const { control, handleSubmit, reset, setError, formState } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentUser.name },
  });
  useEffect(() => reset({ name: currentUser.name }), [currentUser.name, reset]);
  const save = handleSubmit(async (values) => {
    try {
      const result = await mockApi.updateProfile(values);
      setUser(result.user);
      reset({ name: result.user.name });
      toast.success("个人资料已更新");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "保存失败" });
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">个人中心</h2>
        <p className="mt-1 text-muted">查看并维护你的账号信息。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 text-center">
            <Avatar className="size-16">
              <Avatar.Fallback className="bg-accent/15 text-xl font-semibold text-accent">
                {currentUser.name.slice(0, 1)}
              </Avatar.Fallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{currentUser.name}</p>
              <p className="text-sm text-muted">{currentUser.email}</p>
            </div>
            <Chip variant="soft">
              <Chip.Label>{currentUser.role === "admin" ? "管理员" : "编辑者"}</Chip.Label>
            </Chip>
          </Card.Content>
        </Card>
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>账号信息</Card.Title>
              <Card.Description>邮箱和角色由管理员维护。</Card.Description>
            </Card.Header>
            <Card.Content>
              <form className="space-y-5" onSubmit={save}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <TextField fullWidth isInvalid={fieldState.invalid} {...field}>
                      <Label>姓名</Label>
                      <Input variant="secondary" />
                      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </TextField>
                  )}
                />
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted">邮箱</p>
                    <p className="mt-1 font-medium">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-muted">角色</p>
                    <p className="mt-1 font-medium">{currentUser.role === "admin" ? "管理员" : "编辑者"}</p>
                  </div>
                </div>
                {formState.errors.root && <p className="text-sm text-danger">{formState.errors.root.message}</p>}
                <Button isPending={formState.isSubmitting} type="submit" variant="primary">
                  保存资料
                </Button>
              </form>
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
