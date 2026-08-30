import { useUiStore } from "~/stores/ui";

/**
 * 极简 i18n：以界面中文原文为键，仅维护英文词典。
 * - 中文态直接返回原文，零查表成本；
 * - 英文态查词典，未收录的文案回退显示原文，可随迭代逐步补齐；
 * - 新页面接入：把需要翻译的文案用 t() 包一层，再在 en 表里补键即可。
 */
const en: Record<string, string> = {
  // 侧边导航
  概览: "Overview",
  用户与权限: "Users & Permissions",
  用户管理: "User Management",
  系统管理: "System",
  配置中心: "Configuration",
  系统设置: "System Settings",
  通知设置: "Notifications",
  分析中心: "Analytics",
  数据分析: "Data Analysis",
  指标配置: "Metric Settings",
  趋势分析: "Trend Analysis",
  报表中心: "Reports",
  销售报表: "Sales Reports",
  系统工具: "System Tools",
  任务中心: "Task Center",
  执行记录: "Executions",
  运行详情: "Run Details",
  运营控制台: "Operations Console",
  // 顶栏与用户卡片
  打开菜单: "Open menu",
  收起侧边栏: "Collapse sidebar",
  展开侧边栏: "Expand sidebar",
  切换为全宽: "Switch to full width",
  切换为定宽: "Switch to fixed width",
  切换到深色模式: "Switch to dark mode",
  切换到浅色模式: "Switch to light mode",
  切换到英文: "Switch to English",
  切换到中文: "Switch to Chinese",
  面包屑: "Breadcrumb",
  搜索: "Search",
  搜索菜单与页面: "Search menus and pages…",
  未找到匹配的页面: "No matching pages",
  个人设置: "Account Settings",
  退出登录: "Sign out",
  通知: "Notifications",
  暂无通知: "No notifications yet",
  全部已读: "Mark all as read",
  // 示例与异常页菜单
  示例: "Examples",
  表单: "Forms",
  表格: "Tables",
  验证码: "Captcha",
  弹窗: "Modals",
  抽屉: "Drawers",
  异常页: "Error Pages",
  个人页: "Personal",
  个人中心: "Profile Center",
  返回概览: "Back to Overview",
  返回上一页: "Go Back",
};

export type Translator = (text: string) => string;

export function useT(): Translator {
  const locale = useUiStore((state) => state.locale);
  return locale === "zh" ? (text) => text : (text) => en[text] ?? text;
}
