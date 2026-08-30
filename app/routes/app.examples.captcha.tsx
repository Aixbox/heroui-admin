import { Button, Card, Chip, InputOTP } from "@heroui/react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

const CAPTCHA = "123456";

export default function CaptchaExamplePage() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">验证码示例</h2>
        <p className="mt-1 text-muted">基于 HeroUI InputOTP 的验证码输入与校验。</p>
      </div>
      <Card className="max-w-md">
        <Card.Header>
          <Card.Title>短信验证码</Card.Title>
          <Card.Description>演示验证码为 {CAPTCHA}，输入后点击验证。</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <InputOTP
            maxLength={6}
            variant="secondary"
            value={value}
            onChange={(nextValue) => {
              setValue(nextValue);
              setResult("idle");
            }}
          >
            <InputOTP.Group>
              <InputOTP.Slot index={0} />
              <InputOTP.Slot index={1} />
              <InputOTP.Slot index={2} />
            </InputOTP.Group>
            <InputOTP.Separator />
            <InputOTP.Group>
              <InputOTP.Slot index={3} />
              <InputOTP.Slot index={4} />
              <InputOTP.Slot index={5} />
            </InputOTP.Group>
          </InputOTP>
          <div className="flex items-center gap-3">
            <Button
              isDisabled={value.length < 6}
              variant="primary"
              onPress={() => setResult(value === CAPTCHA ? "success" : "error")}
            >
              验证
            </Button>
            <Button
              variant="ghost"
              onPress={() => {
                setValue("");
                setResult("idle");
              }}
            >
              重置
            </Button>
            {result === "success" && (
              <Chip color="success" variant="primary">
                <Chip.Label>验证成功</Chip.Label>
              </Chip>
            )}
            {result === "error" && (
              <Chip color="danger" variant="primary">
                <Chip.Label>验证失败</Chip.Label>
              </Chip>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
