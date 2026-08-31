import { Card, Chip, Table } from "@heroui/react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/lib/auth";
import { mockApi } from "~/lib/mock-api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const stats = await mockApi.stats({ headers: { Cookie: request.headers.get("Cookie") ?? "" } });
  return { stats };
}

// 趋势图仍使用本地演示序列；核心指标通过 API loader 获取。
const monthly = [
  { month: "1月", visits: 6200, downloads: 2100, newUsers: 380, activeUsers: 4100 },
  { month: "2月", visits: 7100, downloads: 2400, newUsers: 420, activeUsers: 4400 },
  { month: "3月", visits: 6800, downloads: 2600, newUsers: 460, activeUsers: 4700 },
  { month: "4月", visits: 8400, downloads: 2900, newUsers: 520, activeUsers: 5100 },
  { month: "5月", visits: 9100, downloads: 3200, newUsers: 560, activeUsers: 5600 },
  { month: "6月", visits: 8800, downloads: 3500, newUsers: 610, activeUsers: 6200 },
  { month: "7月", visits: 10400, downloads: 3800, newUsers: 680, activeUsers: 6900 },
  { month: "8月", visits: 11800, downloads: 4200, newUsers: 740, activeUsers: 7600 },
];

const trafficSources = [
  { name: "搜索引擎", value: 46 },
  { name: "直接访问", value: 26 },
  { name: "社交媒体", value: 17 },
  { name: "其他", value: 11 },
];

const chartColors = ["oklch(62% .195 253.83)", "oklch(73% .1935 150.81)", "oklch(80% .16 80)", "oklch(68% .19 10)"];

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--separator)",
  borderRadius: "0.65rem",
  fontSize: "12px",
  color: "var(--foreground)",
};

const orders = [
  { id: "#10482", customer: "Ada Lovelace", product: "企业版授权", amount: "¥1,280", status: "已支付" },
  { id: "#10481", customer: "Grace Hopper", product: "专业版订阅", amount: "¥860", status: "已支付" },
  { id: "#10480", customer: "Alan Turing", product: "团队版年费", amount: "¥2,430", status: "待支付" },
  { id: "#10479", customer: "Marie Curie", product: "增量服务包", amount: "¥540", status: "已退款" },
];

const statusColor = { 已支付: "success", 待支付: "warning", 已退款: "danger" } as const;

export default function DashboardPage() {
  const { stats: dashboardStats } = useLoaderData<typeof loader>();
  const stats = [
    { label: "营业收入", value: dashboardStats.revenue, detail: "较上月 +12.5%", up: true },
    { label: "订单数", value: dashboardStats.orders.toLocaleString(), detail: "较上月 +8.2%", up: true },
    { label: "用户数", value: dashboardStats.customers.toLocaleString(), detail: "较上月 +5.4%", up: true },
    { label: "转化率", value: dashboardStats.conversion, detail: "较上月 -2.1%", up: false },
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">业务概览</h2>
          <Chip color="warning" variant="soft">
            <Chip.Label>Mock 数据</Chip.Label>
          </Chip>
        </div>
        <p className="mt-1 text-muted">当前展示本地演示数据，后续将替换为正式后端。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Card.Header>
              <Card.Description>{stat.label}</Card.Description>
              <Card.Title className="mt-2 text-3xl">{stat.value}</Card.Title>
            </Card.Header>
            <Card.Footer>
              <p className={`text-sm font-medium ${stat.up ? "text-success" : "text-danger"}`}>
                {stat.up ? "↑" : "↓"} {stat.detail.replace("较上月 ", "")}
              </p>
            </Card.Footer>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>访问量趋势</Card.Title>
            <Card.Description>近 8 个月每月访问量（曲线图）。</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72 text-muted">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.25} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    name="访问量"
                    stroke={chartColors[0]}
                    strokeWidth={2}
                    fill="url(#visitsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>流量来源</Card.Title>
            <Card.Description>本月访问来源占比（饼图）。</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-56 text-muted">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={4}
                    cornerRadius={10}
                    strokeWidth={0}
                  >
                    {trafficSources.map((source, index) => (
                      <Cell key={source.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {trafficSources.map((source, index) => (
                <div className="flex items-center gap-1.5 text-xs text-muted" key={source.name}>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  {source.name} · {source.value}%
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>下载量统计</Card.Title>
            <Card.Description>近 8 个月每月下载量（柱状图）。</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72 text-muted">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.25} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "currentColor", fillOpacity: 0.06 }} />
                  <Bar dataKey="downloads" name="下载量" fill={chartColors[0]} radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>用户数据</Card.Title>
            <Card.Description>新增用户与活跃用户对比（折线图）。</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72 text-muted">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.25} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "currentColor", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    name="新增用户"
                    stroke={chartColors[1]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartColors[1], strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="活跃用户"
                    stroke={chartColors[2]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: chartColors[2], strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight">最近订单</h3>
        <p className="mt-0.5 text-sm text-muted">最新 4 条订单记录，均为 Mock 数据。</p>
      </div>
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
                    <Chip color={statusColor[order.status as keyof typeof statusColor]} variant="soft">
                      <Chip.Label>{order.status}</Chip.Label>
                    </Chip>
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
