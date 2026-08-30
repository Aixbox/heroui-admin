import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonGroup, Checkbox, FieldError, Form, Input, Label, TextField, useTheme } from "@heroui/react";
import { Globe2, KeyRound, Languages, LogIn, Moon, Sun, UserPlus } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  data,
  redirect,
  useActionData,
  useNavigate,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { z } from "zod";
import { mockApi } from "~/lib/mock-api";
import { useAuthStore } from "~/stores/auth";

const schema = z.object({
  email: z.email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});
type LoginValues = z.infer<typeof schema>;

const registerSchema = z
  .object({
    name: z.string().min(2, "请输入姓名"),
    email: z.email("请输入有效邮箱"),
    password: z.string().min(6, "密码至少 6 位"),
    confirmPassword: z.string().min(6, "请再次输入密码"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });
type RegisterValues = z.infer<typeof registerSchema>;

const translations = {
  zh: {
    switchLanguage: "切换到英文",
    lightTheme: "切换到浅色模式",
    darkTheme: "切换到深色模式",
    imageLabel: "Acme Admin 品牌图片",
    loginTitle: "欢迎回来",
    registerTitle: "创建账号",
    loginDescription: "使用你的工作区账号登录 Acme Admin。",
    registerDescription: "注册一个账号，开始使用 Acme Admin。",
    name: "姓名",
    namePlaceholder: "请输入姓名",
    email: "邮箱",
    password: "密码",
    passwordPlaceholder: "请输入密码",
    newPasswordPlaceholder: "至少 6 位字符",
    confirmPassword: "确认密码",
    confirmPasswordPlaceholder: "请再次输入密码",
    rememberAccount: "记住账号",
    forgotPassword: "忘记密码？",
    signingIn: "登录中…",
    signIn: "登录",
    otherMethods: "其他登录方式",
    oidc: "使用 OIDC 登录",
    noAccount: "还没有账号？",
    registerNow: "立即注册",
    demoAccount: "演示账号：admin@acme.com",
    demoPassword: "演示密码：acme-demo-7Kx92m",
    createAccount: "创建账号",
    hasAccount: "已有账号？",
    backToLogin: "返回登录",
  },
  en: {
    switchLanguage: "Switch to Chinese",
    lightTheme: "Switch to light mode",
    darkTheme: "Switch to dark mode",
    imageLabel: "Acme Admin brand image",
    loginTitle: "Welcome back",
    registerTitle: "Create account",
    loginDescription: "Sign in with your workspace account.",
    registerDescription: "Create an account to start using Acme Admin.",
    name: "Name",
    namePlaceholder: "Enter your name",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    newPasswordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Enter your password again",
    rememberAccount: "Remember account",
    forgotPassword: "Forgot password?",
    signingIn: "Signing in…",
    signIn: "Sign in",
    otherMethods: "Other sign-in methods",
    oidc: "Continue with OIDC",
    noAccount: "Don't have an account?",
    registerNow: "Sign up",
    demoAccount: "Demo account: admin@acme.com",
    demoPassword: "Demo password: acme-demo-7Kx92m",
    createAccount: "Create account",
    hasAccount: "Already have an account?",
    backToLogin: "Back to sign in",
  },
} as const;

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
  const { resolvedTheme, setTheme } = useTheme("system");
  const setUser = useAuthStore((state) => state.setUser);
  const [language, setLanguage] = useState<keyof typeof translations>("zh");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");
  const t = translations[language];
  const isDark = resolvedTheme === "dark";
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@acme.com", password: "acme-demo-7Kx92m" },
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

  const toggleLanguage = () => {
    const nextLanguage = language === "zh" ? "en" : "zh";
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
  };

  const toggleTheme = (theme: "light" | "dark") => {
    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.dataset.theme = theme;
      setTheme(theme);
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    document.startViewTransition(applyTheme);
  };

  return (
    <main className="grid min-h-screen gap-8 bg-background p-3 text-foreground sm:p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)] lg:gap-12 lg:p-7">
      <section
        aria-label={t.imageLabel}
        className="relative hidden min-h-[34rem] overflow-hidden rounded-[2.75rem] bg-cover bg-center lg:block"
        style={{ backgroundImage: "url('/山峰.jpg')" }}
      />

      <section className="relative flex min-h-[34rem] items-center justify-center px-5 pt-24 pb-10 sm:px-10 lg:px-14 lg:py-16 xl:px-20">
        <ButtonGroup
          className="absolute top-5 right-5 sm:right-10 lg:top-0 lg:right-6 xl:right-10"
          size="sm"
          variant="tertiary"
        >
          <Button aria-label={t.switchLanguage} className="min-w-20" type="button" onPress={toggleLanguage}>
            <Languages aria-hidden="true" className="size-4" />
            {language === "zh" ? "EN" : "中文"}
          </Button>
          <Button
            isIconOnly
            aria-label={isDark ? t.lightTheme : t.darkTheme}
            type="button"
            onPress={() => toggleTheme(isDark ? "light" : "dark")}
          >
            <ButtonGroup.Separator />
            {isDark ? <Sun aria-hidden="true" className="size-4" /> : <Moon aria-hidden="true" className="size-4" />}
          </Button>
        </ButtonGroup>
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="mb-3 grid size-16 place-items-center rounded-2xl bg-accent/15 p-3">
              <img alt="Acme Admin" className="size-full object-contain" src="/logo.svg" />
            </div>
            <h1 className="font-['Noto_Serif_SC',serif] text-3xl font-black tracking-[-0.04em]">
              {mode === "login" ? t.loginTitle : t.registerTitle}
            </h1>
            <p className="text-muted">{mode === "login" ? t.loginDescription : t.registerDescription}</p>
          </div>
          <div className="pt-8">
            {mode === "login" ? (
              <>
                <Form className="flex flex-col gap-5" method="post" onSubmit={onSubmit} validationBehavior="aria">
                  <input name="redirectTo" type="hidden" value={searchParams.get("redirectTo") || "/app"} />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.email}</Label>
                        <Input autoComplete="email" placeholder="admin@acme.com" type="email" />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.password}</Label>
                        <Input autoComplete="current-password" placeholder={t.passwordPlaceholder} type="password" />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <div className="flex items-center justify-between gap-4">
                    <Checkbox className="text-sm" name="rememberAccount">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        {t.rememberAccount}
                      </Checkbox.Content>
                    </Checkbox>
                    <button
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                      type="button"
                    >
                      <KeyRound aria-hidden="true" className="size-3.5" />
                      {t.forgotPassword}
                    </button>
                  </div>
                  {serverError || actionData?.error ? (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                      {serverError || actionData?.error}
                    </p>
                  ) : null}
                  <Button fullWidth isPending={isSubmitting} type="submit" variant="primary">
                    {isSubmitting ? t.signingIn : t.signIn}
                  </Button>
                </Form>
                <div className="mt-6 space-y-5">
                  <div className="relative flex items-center">
                    <span className="w-full border-t border-separator" />
                    <p className="mx-3 shrink-0 text-xs tracking-[0.16em] text-muted uppercase">{t.otherMethods}</p>
                    <span className="w-full border-t border-separator" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button fullWidth type="button" variant="outline">
                      <span className="mr-2 inline-flex size-4 shrink-0 items-center justify-center leading-none">
                        <FaGoogle aria-hidden="true" className="block size-4" />
                      </span>
                      Google
                    </Button>
                    <Button fullWidth type="button" variant="outline">
                      <span className="mr-2 inline-flex size-4 shrink-0 items-center justify-center leading-none">
                        <FaGithub aria-hidden="true" className="block size-4" />
                      </span>
                      GitHub
                    </Button>
                  </div>
                  <Button fullWidth type="button" variant="secondary">
                    <Globe2 aria-hidden="true" className="mr-2 size-4" />
                    {t.oidc}
                  </Button>
                  <p className="text-center text-sm text-muted">
                    {t.noAccount}{" "}
                    <button
                      className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline"
                      onClick={() => {
                        setMode("register");
                        setServerError("");
                      }}
                      type="button"
                    >
                      <UserPlus aria-hidden="true" className="size-3.5" />
                      {t.registerNow}
                    </button>
                  </p>
                  <div className="rounded-xl bg-surface-secondary p-3 text-sm text-muted">
                    <p>{t.demoAccount}</p>
                    <p className="mt-1">{t.demoPassword}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Form
                  className="flex flex-col gap-5"
                  onSubmit={handleRegisterSubmit(() => undefined)}
                  validationBehavior="aria"
                >
                  <Controller
                    control={registerControl}
                    name="name"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.name}</Label>
                        <Input autoComplete="name" placeholder={t.namePlaceholder} />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <Controller
                    control={registerControl}
                    name="email"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.email}</Label>
                        <Input autoComplete="email" placeholder="name@example.com" type="email" />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <Controller
                    control={registerControl}
                    name="password"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.password}</Label>
                        <Input autoComplete="new-password" placeholder={t.newPasswordPlaceholder} type="password" />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <Controller
                    control={registerControl}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <TextField
                        fullWidth
                        isInvalid={fieldState.invalid}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <Label>{t.confirmPassword}</Label>
                        <Input autoComplete="new-password" placeholder={t.confirmPasswordPlaceholder} type="password" />
                        {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                      </TextField>
                    )}
                  />
                  <Button className="mt-2" fullWidth type="submit" variant="primary">
                    {t.createAccount}
                  </Button>
                </Form>
                <p className="mt-6 text-center text-sm text-muted">
                  {t.hasAccount}{" "}
                  <button
                    className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline"
                    onClick={() => setMode("login")}
                    type="button"
                  >
                    <LogIn aria-hidden="true" className="size-3.5" />
                    {t.backToLogin}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
