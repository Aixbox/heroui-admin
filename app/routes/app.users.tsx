import { Button, Chip, Table } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { Access } from "~/components/access";
import { requirePermi } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermi(request, "app:user:list");
  return null;
}
const users = [
  { name: "Ada Lovelace", email: "admin@acme.com", role: "管理员", status: "活跃" },
  { name: "Grace Hopper", email: "grace@acme.com", role: "编辑者", status: "活跃" },
  { name: "Alan Turing", email: "alan@acme.com", role: "编辑者", status: "待审核" },
];
export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">用户管理</h2>
        <p className="mt-1 text-muted">管理工作区成员及其访问权限。</p>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold tracking-tight">团队成员</h3>
        <Access permission="app:user:add">
          <Button size="sm" variant="primary">
            新增用户
          </Button>
        </Access>
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="团队成员">
            <Table.Header>
              <Table.Column isRowHeader>成员</Table.Column>
              <Table.Column>角色</Table.Column>
              <Table.Column>状态</Table.Column>
              <Table.Column>操作</Table.Column>
            </Table.Header>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.email}>
                  <Table.Cell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>
                    <Chip color={user.status === "活跃" ? "success" : "warning"} variant="primary">
                      <Chip.Label>{user.status}</Chip.Label>
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Access permission="app:user:edit">
                        <Button size="sm" variant="ghost">
                          编辑
                        </Button>
                      </Access>
                      <Access permission="app:user:remove">
                        <Button size="sm" variant="ghost" className="text-danger">
                          删除
                        </Button>
                      </Access>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
