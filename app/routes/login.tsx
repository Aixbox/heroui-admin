import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { data, redirect, useActionData, useNavigate, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { z } from "zod";
import { mockApi } from "~/lib/mock-api";
import { useAuthStore } from "~/stores/auth";

const schema = z.object({
  email: z.email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});
type LoginValues = z.infer<typeof schema>;

const registerSchema = z.object({
  name: z.string().min(2, "请输入姓名"),
  email: z.email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  confirmPassword: z.string().min(6, "请再次输入密码"),
}).refine((values) => values.password === values.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});
type RegisterValues = z.infer<typeof registerSchema>;

export const meta: MetaFunction = () => [{ title: "登录 · Acme Admin" }];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await mockApi.me({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
    return redirect("/app");
  } catch {
    return null;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) return data({ error: "请检查邮箱和密码格式" }, { status: 400 });

  const response = await fetch(`${process.env.MOCK_API_URL ?? "http://localhost:8787"}/mock-api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  });
  const payload = (await response.json()) as { message?: string };
  if (!response.ok) return data({ error: payload.message ?? "登录失败" }, { status: response.status });

  const redirectTo = String(formData.get("redirectTo") || "/app");
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/app";
  const setCookie = response.headers.get("Set-Cookie");
  return redirect(safeRedirect, { headers: setCookie ? { "Set-Cookie": setCookie } : undefined });
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const setUser = useAuthStore((state) => state.setUser);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@acme.com", password: "admin123" },
  });
  const { control: registerControl, handleSubmit: handleRegisterSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const { user } = await mockApi.login(values.email, values.password);
      setUser(user);
      navigate(searchParams.get("redirectTo") || "/app", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "登录失败");
    }
  });

  return (
    <main className="grid min-h-screen gap-8 bg-background p-3 sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)] lg:gap-12 lg:p-7">
      <section
        aria-label="Acme Admin 品牌图片"
        className="relative hidden min-h-[34rem] overflow-hidden rounded-[2.75rem] bg-cover bg-center lg:block"
        style={{ backgroundImage: "url('/山峰.jpg')" }}
      />

      <section className="flex min-h-[34rem] items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="mb-3 grid size-16 place-items-center rounded-2xl bg-accent/15 p-3">
              <img alt="Acme Admin" className="size-full object-contain" src="/logo.svg" />
            </div>
            <h1 className="font-['Noto_Serif_SC',serif] text-3xl font-black tracking-[-0.04em]">{mode === "login" ? "欢迎回来" : "创建账号"}</h1>
            <p className="text-muted">{mode === "login" ? "使用你的工作区账号登录 Acme Admin。" : "注册一个账号，开始使用 Acme Admin。"}</p>
          </div>
          <div className="pt-8">
            {mode === "login" ? (
              <>
                <Form className="flex flex-col gap-5" method="post" onSubmit={onSubmit} validationBehavior="aria">
                  <input name="redirectTo" type="hidden" value={searchParams.get("redirectTo") || "/app"} />
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
                  <div className="-mt-3 flex justify-end">
                    <button className="text-sm font-medium text-accent underline-offset-4 hover:underline" type="button">忘记密码？</button>
                  </div>
                  {serverError || actionData?.error ? <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError || actionData?.error}</p> : null}
                  <Button className="mt-2" fullWidth isPending={isSubmitting} type="submit" variant="primary">{isSubmitting ? "登录中…" : "登录"}</Button>
                </Form>
                <div className="mt-6 space-y-5 border-t border-separator pt-5">
                  <p className="text-center text-sm text-muted">
                    还没有账号？ <button className="font-medium text-accent underline-offset-4 hover:underline" onClick={() => { setMode("register"); setServerError(""); }} type="button">立即注册</button>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-separator" /></div>
                    <p className="relative mx-auto w-fit bg-background px-3 text-xs uppercase tracking-[0.16em] text-muted">其他登录方式</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button fullWidth type="button" variant="outline"><span aria-hidden="true" className="mr-2 font-semibold">G</span>Google</Button>
                    <Button fullWidth type="button" variant="outline"><span aria-hidden="true" className="mr-2 font-semibold">GH</span>GitHub</Button>
                  </div>
                  <Button fullWidth type="button" variant="secondary">使用 OIDC 登录</Button>
                  <div className="rounded-xl bg-surface-secondary p-3 text-sm text-muted">
                    <p>演示账号：admin@acme.com</p>
                    <p className="mt-1">演示密码：admin123</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Form className="flex flex-col gap-5" onSubmit={handleRegisterSubmit(() => undefined)} validationBehavior="aria">
                  <Controller control={registerControl} name="name" render={({ field, fieldState }) => (
                    <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                      <Label>姓名</Label><Input autoComplete="name" placeholder="请输入姓名" />
                      {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                    </TextField>
                  )} />
                  <Controller control={registerControl} name="email" render={({ field, fieldState }) => (
                    <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                      <Label>邮箱</Label><Input autoComplete="email" placeholder="name@example.com" type="email" />
                      {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                    </TextField>
                  )} />
                  <Controller control={registerControl} name="password" render={({ field, fieldState }) => (
                    <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                      <Label>密码</Label><Input autoComplete="new-password" placeholder="至少 6 位字符" type="password" />
                      {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                    </TextField>
                  )} />
                  <Controller control={registerControl} name="confirmPassword" render={({ field, fieldState }) => (
                    <TextField fullWidth isInvalid={fieldState.invalid} name={field.name} value={field.value} onChange={field.onChange}>
                      <Label>确认密码</Label><Input autoComplete="new-password" placeholder="请再次输入密码" type="password" />
                      {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                    </TextField>
                  )} />
                  <Button className="mt-2" fullWidth type="submit" variant="primary">创建账号</Button>
                </Form>
                <p className="mt-6 border-t border-separator pt-5 text-center text-sm text-muted">
                  已有账号？ <button className="font-medium text-accent underline-offset-4 hover:underline" onClick={() => setMode("login")} type="button">返回登录</button>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
