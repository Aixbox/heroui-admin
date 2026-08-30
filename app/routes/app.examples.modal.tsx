import { Button, Card, Modal } from "@heroui/react";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

export default function ModalExamplePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">弹窗示例</h2>
        <p className="mt-1 text-muted">基础弹窗与受控确认弹窗，支持 Esc 和点击遮罩关闭。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>基础弹窗</Card.Title>
            <Card.Description>触发按钮直接作为 Modal 的第一个子元素。</Card.Description>
          </Card.Header>
          <Card.Content>
            <Modal>
              <Button variant="primary">打开弹窗</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog className="max-w-md">
                    <Modal.Header>
                      <Modal.Heading>操作提示</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p className="text-sm text-muted">
                        这是一个基础弹窗。点击遮罩、按 Esc 或点击下方按钮都可以关闭。
                      </p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Modal.CloseTrigger />
                      <Button variant="primary">我知道了</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>受控确认弹窗</Card.Title>
            <Card.Description>通过 isOpen / onOpenChange 控制开关状态。</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Button
              variant="outline"
              onPress={() => {
                setConfirmed(false);
                setConfirmOpen(true);
              }}
            >
              打开确认弹窗
            </Button>
            {confirmed && <p className="text-sm text-success">已确认执行该操作。</p>}
            <Modal isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog className="max-w-md">
                    <Modal.Header>
                      <Modal.Heading>确认操作</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p className="text-sm text-muted">确定要执行该操作吗？该操作不可撤销。</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="ghost" onPress={() => setConfirmOpen(false)}>
                        取消
                      </Button>
                      <Button
                        variant="danger"
                        onPress={() => {
                          setConfirmed(true);
                          setConfirmOpen(false);
                        }}
                      >
                        确认执行
                      </Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
