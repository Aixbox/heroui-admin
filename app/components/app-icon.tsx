import {
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SlidersHorizontal,
  Sun,
  Users,
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
  logout: LogOut,
  analytics: ChartNoAxesCombined,
  widthFull: Maximize2,
  widthFixed: Minimize2,
  sun: Sun,
  moon: Moon,
} satisfies Record<string, ComponentType<LucideProps>>;

export function AppIcon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
