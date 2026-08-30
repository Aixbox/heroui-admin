import { Button, Card, Checkbox, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function FormExamplePage() {
  const [name, setName] = useState("Ada Lovelace");
  const [email, setEmail] = useState("ada@acme.com");
  const [subscribed, setSubscribed] = useState(true);
  const [submitted, setSubmitted] = useState<{ name: string; email: string; subscribed: boolean } | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">表单示例</h2>
        <p className="mt-1 text-muted">基于 HeroUI TextField 与 Checkbox 的受控表单。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>基本信息</Card.Title>
            <Card.Description>填写后点击保存，查看右侧受控状态回显。</Card.Description>
          </Card.Header>
          <Card.Content>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted({ name, email, subscribed });
              }}
            >
              {/* Surface（Card）内的输入框按官方约定使用 secondary 变体，避免与卡片底色融为一体 */}
              <TextField name="name" value={name} onChange={setName}>
                <Label>姓名</Label>
                <Input variant="secondary" />
              </TextField>
              <TextField name="email" value={email} onChange={setEmail}>
                <Label>邮箱</Label>
                <Input variant="secondary" />
              </TextField>
              <Checkbox isSelected={subscribed} name="subscribe" onChange={setSubscribed}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  订阅产品更新通知
                </Checkbox.Content>
              </Checkbox>
              <Button type="submit" variant="primary">
                保存
              </Button>
            </form>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>提交结果</Card.Title>
            <Card.Description>展示当前受控表单的实时状态。</Card.Description>
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
