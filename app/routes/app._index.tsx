import { useQuery } from "@tanstack/react-query";
import { Card, Chip, Spinner } from "@heroui/react";
import type { LoaderFunctionArgs } from "react-router";
import { api } from "~/lib/api";
import { requireUser } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) { await requireUser(request); return null; }

const cards = [
  { key: "revenue", label: "总收入", detail: "较上月 +12.5%" },
  { key: "orders", label: "订单数", detail: "较上月 +8.2%" },
  { key: "customers", label: "活跃客户", detail: "较上月 +5.4%" },
  { key: "conversion", label: "转化率", detail: "较上月 +2.1%" },
] as const;

export default function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => api.stats() });
  return <div className="space-y-8"><div><h2 className="text-2xl font-semibold tracking-tight">业务概览</h2><p className="mt-1 text-muted">实时查看核心业务指标和近期活动。</p></div>{query.isLoading ? <div className="grid place-items-center py-20"><Spinner /></div> : query.isError ? <Card className="p-6 text-danger">加载数据失败，请确认 API 服务已启动。</Card> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Card key={card.key} className="p-5"><Card.Header className="p-0"><Card.Description>{card.label}</Card.Description><Card.Title className="mt-2 text-3xl">{query.data?.[card.key]}</Card.Title></Card.Header><Card.Footer className="p-0 pt-4"><Chip color="success" variant="primary"><Chip.Label>{card.detail}</Chip.Label></Chip></Card.Footer></Card>)}</div><Card className="p-6"><Card.Header className="p-0"><Card.Title>近期活动</Card.Title><Card.Description>你的团队最近发生了这些变化。</Card.Description></Card.Header><Card.Content className="mt-5 space-y-4 p-0">{["新用户注册：sarah@example.com", "订单 #10482 已完成支付", "系统设置已更新"].map((text, index) => <div className="flex items-center gap-3 border-b border-separator pb-4 last:border-0 last:pb-0" key={text}><div className="grid size-8 place-items-center rounded-full bg-accent/10 text-xs font-semibold text-accent">{index + 1}</div><p className="text-sm">{text}</p><span className="ml-auto text-xs text-muted">刚刚</span></div>)}</Card.Content></Card></>}</div>;
}
