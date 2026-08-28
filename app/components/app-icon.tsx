import { ChartNoAxesCombined, LayoutDashboard, LogOut, Menu, Settings, Users, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";

const icons = {
  dashboard: LayoutDashboard,
  users: Users,
  settings: Settings,
  menu: Menu,
  logout: LogOut,
  analytics: ChartNoAxesCombined,
} satisfies Record<string, ComponentType<LucideProps>>;

export function AppIcon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
