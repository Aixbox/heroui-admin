import { Card, Chip, Table } from "@heroui/react";
import { requireUser } from "~/lib/auth";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
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
      <Card>
        <Card.Header>
          <Card.Title>团队成员</Card.Title>
          <Card.Description>共 {users.length} 位成员</Card.Description>
        </Card.Header>
        <Card.Content>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="团队成员">
                <Table.Header>
                  <Table.Column isRowHeader>成员</Table.Column>
                  <Table.Column>角色</Table.Column>
                  <Table.Column>状态</Table.Column>
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
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
}
