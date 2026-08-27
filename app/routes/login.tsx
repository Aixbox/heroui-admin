import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { redirect, useNavigate, useSearchParams, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { z } from "zod";
import { api } from "~/lib/api";
import { useAuthStore } from "~/stores/auth";

const schema = z.object({
  email: z.email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});
type LoginValues = z.infer<typeof schema>;

export const meta: MetaFunction = () => [{ title: "登录 · Acme Admin" }];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await api.me({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
    return redirect("/app");
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@acme.com", password: "admin123" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const { user } = await api.login(values.email, values.password);
      setUser(user);
      navigate(searchParams.get("redirectTo") || "/app", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "登录失败");
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,var(--color-accent-soft),transparent_38%)] px-4 py-12">
      <Card className="w-full max-w-md p-2">
        <Card.Header className="flex-col items-start gap-2 p-6 pb-2">
          <div className="grid size-11 place-items-center rounded-xl bg-accent text-lg font-bold text-accent-foreground">A</div>
          <Card.Title className="text-2xl">登录 Acme Admin</Card.Title>
          <Card.Description>使用演示账号进入受保护的后台工作区。</Card.Description>
        </Card.Header>
        <Card.Content className="p-6 pt-4">
          <Form className="flex flex-col gap-5" onSubmit={onSubmit} validationBehavior="aria">
            <Controller control={control} name="email" render={({ field, fieldState }) => (
              <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                <Label>邮箱</Label><Input autoComplete="email" placeholder="admin@acme.com" type="email" />
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </TextField>
            )} />
            <Controller control={control} name="password" render={({ field, fieldState }) => (
              <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                <Label>密码</Label><Input autoComplete="current-password" placeholder="请输入密码" type="password" />
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </TextField>
            )} />
            {serverError ? <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p> : null}
            <Button fullWidth isPending={isSubmitting} type="submit" variant="primary">{isSubmitting ? "登录中…" : "登录"}</Button>
          </Form>
          <div className="mt-5 rounded-xl bg-surface-secondary p-3 text-sm text-muted">
            演示账号：admin@acme.com<br />演示密码：admin123
          </div>
        </Card.Content>
      </Card>
    </main>
  );
}
