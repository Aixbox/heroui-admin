import { Card, Chip, Table } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return null;
}

const orders = [
  { id: "#10482", customer: "Ada Lovelace", product: "企业版授权", amount: "¥1,280", status: "已支付" },
  { id: "#10481", customer: "Grace Hopper", product: "专业版订阅", amount: "¥860", status: "已支付" },
  { id: "#10480", customer: "Alan Turing", product: "团队版年费", amount: "¥2,430", status: "待支付" },
  { id: "#10479", customer: "Marie Curie", product: "增量服务包", amount: "¥540", status: "已退款" },
];

const statusColor = { 已支付: "success", 待支付: "warning", 已退款: "danger" } as const;

export default function TableExamplePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">表格示例</h2>
        <p className="mt-1 text-muted">带状态标签的业务表格展示。</p>
      </div>
      <Card>
        <Card.Header>
          <Card.Title>最近订单</Card.Title>
          <Card.Description>共 {orders.length} 条记录</Card.Description>
        </Card.Header>
        <Card.Content>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="最近订单">
                <Table.Header>
                  <Table.Column isRowHeader>订单号</Table.Column>
                  <Table.Column>客户</Table.Column>
                  <Table.Column>产品</Table.Column>
                  <Table.Column>金额</Table.Column>
                  <Table.Column>状态</Table.Column>
                </Table.Header>
                <Table.Body>
                  {orders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell>
                        <span className="font-medium">{order.id}</span>
                      </Table.Cell>
                      <Table.Cell>{order.customer}</Table.Cell>
                      <Table.Cell>{order.product}</Table.Cell>
                      <Table.Cell>{order.amount}</Table.Cell>
                      <Table.Cell>
                        <Chip color={statusColor[order.status as keyof typeof statusColor]} variant="primary">
                          <Chip.Label>{order.status}</Chip.Label>
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
