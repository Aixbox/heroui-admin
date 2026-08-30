import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Chip, Pagination, SearchField, Spinner, Table } from "@heroui/react";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Access } from "~/components/access";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { requirePermi } from "~/lib/auth";
import { useT } from "~/lib/i18n";
import { mockApi } from "~/lib/mock-api";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermi(request, "app:user:list");
  return null;
}

const PAGE_SIZE = 10;

/** 通用管理页参考模板：搜索（防抖）+ react-query 分页表格 + 按钮级权限，后续管理页按此结构复制 */
export default function UsersPage() {
  const t = useT();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const debouncedKeyword = useDebouncedValue(keyword);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const query = useQuery({
    queryKey: ["users", { page, pageSize: PAGE_SIZE, keyword: debouncedKeyword }],
    queryFn: () => mockApi.users({ page, pageSize: PAGE_SIZE, keyword: debouncedKeyword }),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = query.data?.list ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">用户管理</h2>
        <p className="mt-1 text-muted">管理工作区成员及其访问权限。</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField aria-label={t("搜索")} className="w-72" value={keyword} onChange={setKeyword}>
          <SearchField.Group>
            <SearchField.SearchIcon className="size-4 shrink-0 text-muted" />
            <SearchField.Input className="w-full" placeholder={t("搜索姓名或邮箱")} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Access permission="app:user:add">
          <Button variant="primary">新增用户</Button>
        </Access>
      </div>

      <div className={query.isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="团队成员">
              <Table.Header>
                <Table.Column isRowHeader>成员</Table.Column>
                <Table.Column>角色</Table.Column>
                <Table.Column>状态</Table.Column>
                <Table.Column>操作</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((user) => (
                  <Table.Row key={user.email}>
                    <Table.Cell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{user.role}</Table.Cell>
                    <Table.Cell>
                      <Chip color={user.status === "活跃" ? "success" : "warning"} variant="soft">
                        <Chip.Label>{user.status}</Chip.Label>
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Access permission="app:user:edit">
                          <Button size="sm" variant="ghost">
                            编辑
                          </Button>
                        </Access>
                        <Access permission="app:user:remove">
                          <Button size="sm" variant="ghost" className="text-danger">
                            删除
                          </Button>
                        </Access>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        {!query.isFetching && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">{t("暂无匹配用户")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted">
          {t("共 {total} 条").replace("{total}", String(total))}
          {query.isFetching && <Spinner size="sm" />}
        </p>
        <Pagination className="justify-end">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={page <= 1} onPress={() => setPage((value) => Math.max(1, value - 1))}>
                <Pagination.PreviousIcon />
                <span>上一页</span>
              </Pagination.Previous>
            </Pagination.Item>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Pagination.Item key={pageNumber}>
                <Pagination.Link isActive={pageNumber === page} onPress={() => setPage(pageNumber)}>
                  {pageNumber}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page >= totalPages}
                onPress={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                <span>下一页</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>
    </div>
  );
}
