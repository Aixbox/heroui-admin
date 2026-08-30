import { Button, Card, Drawer } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

const drawers = [
  { placement: "left" as const, name: "左侧抽屉", direction: "左边" },
  { placement: "right" as const, name: "右侧抽屉", direction: "右边" },
  { placement: "top" as const, name: "顶部抽屉", direction: "上方" },
  { placement: "bottom" as const, name: "底部抽屉", direction: "下方" },
];

export default function DrawerExamplePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">抽屉示例</h2>
        <p className="mt-1 text-muted">四个方向的滑出抽屉，支持拖拽关闭与 Esc。</p>
      </div>
      <Card>
        <Card.Header>
          <Card.Title>不同弹出方向</Card.Title>
          <Card.Description>点击按钮查看对应方向的抽屉效果。</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-wrap gap-3">
          {drawers.map((drawer) => (
            <Drawer key={drawer.placement}>
              <Button variant="outline">{drawer.name}</Button>
              <Drawer.Backdrop>
                <Drawer.Content placement={drawer.placement}>
                  <Drawer.Dialog>
                    <Drawer.CloseTrigger />
                    <Drawer.Header>
                      <Drawer.Heading>{drawer.name}</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p className="text-sm text-muted">
                        这是一个从{drawer.direction}滑出的抽屉，拖拽或点击遮罩即可关闭。
                      </p>
                    </Drawer.Body>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          ))}
        </Card.Content>
      </Card>
    </div>
  );
}
