import {
  Bell,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Maximize,
  Maximize2,
  Menu,
  Minimize,
  Minimize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Search,
  Settings,
  SlidersHorizontal,
  Sun,
  TriangleAlert,
  Users,
  X,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const icons = {
  dashboard: LayoutDashboard,
  users: Users,
  settings: Settings,
  configuration: SlidersHorizontal,
  menu: Menu,
  panelClose: PanelLeftClose,
  panelOpen: PanelLeftOpen,
  emptyTabs: PanelsTopLeft,
  logout: LogOut,
  analytics: ChartNoAxesCombined,
  widthFull: Maximize2,
  widthFixed: Minimize2,
  sun: Sun,
  moon: Moon,
  search: Search,
  bell: Bell,
  warning: TriangleAlert,
  fullscreen: Maximize,
  fullscreenExit: Minimize,
  close: X,
} satisfies Record<string, ComponentType<LucideProps>>;

export function AppIcon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Icon = icons[name];
  // 动态菜单下发的 icon 名可能超出图标表范围（后端数据先行），缺省时不渲染避免崩溃
  if (!Icon) return null;
  return <Icon aria-hidden="true" {...props} />;
}
