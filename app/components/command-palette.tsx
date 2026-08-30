import { Modal } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { SidebarNavigationItem } from "~/components/sidebar-navigation";
import { AppIcon } from "~/components/app-icon";
import { useT } from "~/lib/i18n";

type CommandPaletteProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: SidebarNavigationItem[];
};

type FlatPage = { label: string; href: string; trail: string[] };

function flattenPages(items: SidebarNavigationItem[], trail: string[]): FlatPage[] {
  return items.flatMap((item) => {
    const nextTrail = [...trail, item.label];
    if (item.href && !item.children?.length) {
      return [{ label: item.label, href: item.href, trail: trail }];
    }
    return item.children ? flattenPages(item.children, nextTrail) : [];
  });
}

export function CommandPalette({ isOpen, onOpenChange, items }: CommandPaletteProps) {
  const t = useT();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    // 命令面板打开时聚焦搜索框（等价于 autoFocus，但可关闭 jsx-a11y/no-autofocus 告警）
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);
  const pages = useMemo(() => flattenPages(items, []), [items]);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return pages;
    return pages.filter((page) => `${page.trail.join("/")}/${page.label}`.toLowerCase().includes(keyword));
  }, [pages, query]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="top">
          <Modal.Dialog className="max-w-lg">
            <Modal.Body>
              <div className="flex items-center gap-2 border-b border-separator pb-3">
                <AppIcon className="size-4 shrink-0 text-muted" name="search" />
                <input
                  ref={inputRef}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("搜索菜单与页面")}
                  value={query}
                />
              </div>
              <div className="max-h-80 overflow-y-auto pt-1">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">{t("未找到匹配的页面")}</p>
                ) : (
                  <div className="flex flex-col gap-1 py-1">
                    {filtered.map((page) => (
                      <button
                        key={page.href}
                        type="button"
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-start text-sm text-foreground transition hover:bg-surface-secondary"
                        onClick={() => {
                          navigate(page.href);
                          setQuery("");
                          onOpenChange(false);
                        }}
                      >
                        <span>{t(page.label)}</span>
                        {page.trail.length > 0 && (
                          <span className="text-xs text-muted">{page.trail.map((text) => t(text)).join(" / ")}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
