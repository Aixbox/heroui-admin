import { Disclosure, Popover } from "@heroui/react";
import { listboxItemVariants } from "@heroui/styles/components/list-box-item";
import type { ComponentProps } from "react";
import { NavLink } from "react-router";
import { AppIcon } from "~/components/app-icon";

type AppIconName = ComponentProps<typeof AppIcon>["name"];
const navigationItemStyles = listboxItemVariants();
const itemPadding = 12;
const labelIndent = 27;
const nestedRowInset = 8;
const iconSize = 16;
const iconGap = 8;
const iconSlot = iconSize + iconGap;
const firstTextOnlyIndent = labelIndent - iconSlot;
const textOnlyIndent = 17;

/*
 * 内容起点偏移（有图标取图标左边缘，无图标取文字左边缘）：
 *   父级有图标 -> 子级无图标：27px（24px 图标占位 + 3px）
 *   父级无图标 -> 子级有图标：17px
 *   父级有图标 -> 子级有图标：27px
 *   父级无图标 -> 子级无图标：17px
 * 标题文字起点还会根据当前子级是否有图标额外加上 24px 图标占位。
 */

export type SidebarNavigationItem = {
  label: string;
  icon?: AppIconName;
  href?: string;
  end?: boolean;
  children?: SidebarNavigationItem[];
};

type SidebarNavigationProps = {
  items: SidebarNavigationItem[];
  pathname: string;
  collapsed?: boolean;
};

type NavigationItemsProps = SidebarNavigationProps & {
  depth?: number;
  parentHasIcon?: boolean;
  parentLabelStart?: number;
};

function isItemActive(item: SidebarNavigationItem, pathname: string): boolean {
  if (item.children?.some((child) => isItemActive(child, pathname))) return true;
  if (!item.href) return false;
  return item.end ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavIcon({ item }: { item: SidebarNavigationItem }) {
  return item.icon ? (
    <AppIcon className="size-4 shrink-0 text-muted" name={item.icon} />
  ) : (
    // 无图标项在折叠态用首字符占位
    <span aria-hidden className="grid size-4 shrink-0 place-items-center text-[13px] leading-none font-semibold">
      {item.label.slice(0, 1)}
    </span>
  );
}

function NavigationItems({
  items,
  pathname,
  depth = 0,
  parentHasIcon = false,
  parentLabelStart,
}: NavigationItemsProps) {
  return items.map((item) => {
    const isActive = isItemActive(item, pathname);
    const hasIcon = Boolean(item.icon);
    const rowInset = depth * nestedRowInset;
    const contentIndent = parentHasIcon ? firstTextOnlyIndent : textOnlyIndent;
    const labelStart =
      depth === 0
        ? itemPadding + (hasIcon ? iconSlot : 0)
        : (parentLabelStart ?? itemPadding) + contentIndent + (hasIcon ? iconSlot : 0);

    const itemStyle = {
      columnGap: `${iconGap}px`,
      marginInlineStart: `${rowInset}px`,
      paddingInlineEnd: "0.75rem",
      paddingInlineStart: `${labelStart - rowInset - (hasIcon ? iconSlot : 0)}px`,
      width: `calc(100% - ${rowInset}px)`,
    };

    if (item.children?.length) {
      // 类名整体拼好再传，不做模板串内插值：prettier-plugin-tailwindcss 会裁剪模板串表达式内类串的
      // 边界空格（曾两次把 " pb-2" 变成 "pb-2"，拼出无效的 pt-1pb-2，导致菜单间距全部消失）。
      // 一级展开组额外 8px 底距（+外层 gap 4px = 12px，大于父子间 4px）；深层级不叠加，避免间距随深度累积。
      const contentClassName = depth === 0 ? "flex flex-col gap-1 pt-1 pb-2" : "flex flex-col gap-1 pt-1";
      return (
        <Disclosure key={item.label} defaultExpanded={isActive}>
          <Disclosure.Heading className="w-full">
            <Disclosure.Trigger
              className={navigationItemStyles.item({ className: "text-start text-sm text-foreground" })}
              style={itemStyle}
            >
              {item.icon ? <AppIcon className="size-4 shrink-0 text-muted" name={item.icon} /> : null}
              <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
              <Disclosure.Indicator className="text-muted" />
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <div className={contentClassName}>
              <NavigationItems
                depth={depth + 1}
                items={item.children}
                parentHasIcon={hasIcon}
                parentLabelStart={labelStart}
                pathname={pathname}
              />
            </div>
          </Disclosure.Content>
        </Disclosure>
      );
    }

    if (!item.href) return null;

    return (
      <NavLink
        key={item.href}
        end={item.end}
        className={({ isActive: isLinkActive }) =>
          navigationItemStyles.item({
            className: `text-start text-sm no-underline ${isLinkActive ? "bg-default font-medium text-default-foreground" : "text-foreground"}`,
          })
        }
        style={itemStyle}
        to={item.href}
      >
        {item.icon ? <AppIcon className="size-4 shrink-0 text-muted" name={item.icon} /> : null}
        <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
      </NavLink>
    );
  });
}

const collapsedItemStyles = ({ isActive }: { isActive: boolean }) =>
  `flex size-10 shrink-0 items-center justify-center rounded-lg text-sm transition ${
    isActive ? "bg-default font-medium text-default-foreground" : "text-foreground hover:bg-surface-secondary"
  }`;

/* 折叠态：顶层只显示图标；叶子项直链，分组点击后经 Popover 向右弹出完整子树 */
function CollapsedNavigation({ items, pathname }: SidebarNavigationProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {items.map((item) => {
        if (item.children?.length) {
          return (
            <Popover key={item.label}>
              <Popover.Trigger
                aria-label={item.label}
                className={collapsedItemStyles({ isActive: isItemActive(item, pathname) })}
                title={item.label}
              >
                <NavIcon item={item} />
              </Popover.Trigger>
              <Popover.Content placement="right" offset={8}>
                <div className="flex max-h-[70vh] w-60 flex-col gap-1 overflow-y-auto p-2">
                  <NavigationItems items={item.children} pathname={pathname} />
                </div>
              </Popover.Content>
            </Popover>
          );
        }

        if (!item.href) return null;

        return (
          <NavLink
            key={item.href}
            aria-label={item.label}
            className={({ isActive }) => collapsedItemStyles({ isActive })}
            end={item.end}
            title={item.label}
            to={item.href}
          >
            <NavIcon item={item} />
          </NavLink>
        );
      })}
    </div>
  );
}

export function SidebarNavigation({ items, pathname, collapsed = false }: SidebarNavigationProps) {
  if (collapsed) return <CollapsedNavigation items={items} pathname={pathname} />;
  return (
    <div key={pathname} className="flex flex-col gap-1">
      <NavigationItems items={items} pathname={pathname} />
    </div>
  );
}
