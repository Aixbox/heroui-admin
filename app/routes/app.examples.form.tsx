import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Checkbox, FieldError, Input, Label, TextField } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

/** 项目统一表单方案：react-hook-form + zod（与登录页一致），新表单按此结构编写 */
const formSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  email: z.email("邮箱格式不正确"),
  subscribed: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export default function FormExamplePage() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "Ada Lovelace", email: "ada@acme.com", subscribed: true },
  });
  const onSubmit = handleSubmit((values) => setSubmitted(values));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">表单示例</h2>
        <p className="mt-1 text-muted">react-hook-form + zod 的标准受控表单（项目统一表单方案）。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>基本信息</Card.Title>
            <Card.Description>清空姓名或输入非法邮箱可查看校验效果。</Card.Description>
          </Card.Header>
          <Card.Content>
            <form noValidate className="space-y-5" onSubmit={onSubmit}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    isInvalid={fieldState.invalid}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <Label>姓名</Label>
                    <Input variant="secondary" />
                    {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextField
                    isInvalid={fieldState.invalid}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <Label>邮箱</Label>
                    <Input variant="secondary" />
                    {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="subscribed"
                render={({ field }) => (
                  <Checkbox isSelected={field.value} name={field.name} onChange={field.onChange}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      订阅产品更新通知
                    </Checkbox.Content>
                  </Checkbox>
                )}
              />
              <Button isDisabled={formState.isSubmitting} type="submit" variant="primary">
                保存
              </Button>
            </form>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>提交结果</Card.Title>
            <Card.Description>通过 zod 校验后的数据。</Card.Description>
          </Card.Header>
          <Card.Content>
            {submitted ? (
              <pre className="rounded-lg bg-surface-secondary p-4 text-sm">{JSON.stringify(submitted, null, 2)}</pre>
            ) : (
              <p className="text-sm text-muted">尚未提交，左侧填写后点击「保存」。</p>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
