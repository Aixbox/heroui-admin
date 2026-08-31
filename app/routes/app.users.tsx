import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  Button,
  Chip,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Pagination,
  SearchField,
  Select,
  Spinner,
  Table,
  TextField,
  toast,
  type Key,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { Access } from "~/components/access";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { requirePermi } from "~/lib/auth";
import { useT } from "~/lib/i18n";
import { mockApi, type UserInput, type UserListItem, type UserRole } from "~/lib/mock-api";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermi(request, "app:user:list");
  return null;
}

const PAGE_SIZE = 10;
const statusColor = { 活跃: "success", 待审核: "warning", 停用: "danger" } as const;
const roles = [
  { id: "admin", name: "管理员" },
  { id: "editor", name: "编辑者" },
];
const statuses = ["活跃", "待审核", "停用"] as const;
const userSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 个字符"),
  email: z.email("请输入有效邮箱"),
  role: z.enum(["admin", "editor"]),
  status: z.enum(statuses),
});

function toFormValues(user: UserListItem | null): UserInput {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role === "管理员" ? "admin" : "editor",
    status: (user?.status as UserInput["status"]) ?? "活跃",
  };
}

type UserFormDialogProps = {
  user: UserListItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
};

function UserFormDialog({ user, isOpen, onOpenChange, onSaved }: UserFormDialogProps) {
  const { control, handleSubmit, reset, setError, formState } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: toFormValues(user),
  });
  useEffect(() => reset(toFormValues(user)), [reset, user, isOpen]);

  const save = handleSubmit(async (values) => {
    try {
      if (user) await mockApi.updateUser(user.id, values);
      else await mockApi.createUser(values);
      await onSaved();
      toast.success(user ? "用户信息已更新" : "用户已创建");
      onOpenChange(false);
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "保存失败" });
    }
  });

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{user ? "编辑用户" : "新增用户"}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <form id="user-form" className="space-y-4" onSubmit={save}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField fullWidth isInvalid={fieldState.invalid} {...field}>
                    <Label>姓名</Label>
                    <Input autoComplete="name" placeholder="请输入姓名" variant="secondary" />
                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextField fullWidth isInvalid={fieldState.invalid} {...field}>
                    <Label>邮箱</Label>
                    <Input autoComplete="email" placeholder="name@example.com" type="email" variant="secondary" />
                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                  </TextField>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      fullWidth
                      placeholder="请选择角色"
                      value={field.value}
                      variant="secondary"
                      onChange={(value: Key | null) => field.onChange(value as UserRole)}
                    >
                      <Label>角色</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {roles.map((role) => (
                            <ListBox.Item key={role.id} id={role.id} textValue={role.name}>
                              {role.name}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      fullWidth
                      placeholder="请选择状态"
                      value={field.value}
                      variant="secondary"
                      onChange={(value: Key | null) => field.onChange(value as UserInput["status"])}
                    >
                      <Label>状态</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {statuses.map((status) => (
                            <ListBox.Item key={status} id={status} textValue={status}>
                              {status}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
              </div>
              {formState.errors.root && <p className="text-sm text-danger">{formState.errors.root.message}</p>}
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onPress={() => onOpenChange(false)}>
              取消
            </Button>
            <Button isPending={formState.isSubmitting} type="submit" form="user-form" variant="primary">
              保存
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

export default function UsersPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const debouncedKeyword = useDebouncedValue(keyword);
  useEffect(() => setPage(1), [debouncedKeyword]);

  const query = useQuery({
    queryKey: ["users", { page, pageSize: PAGE_SIZE, keyword: debouncedKeyword }],
    queryFn: () => mockApi.users({ page, pageSize: PAGE_SIZE, keyword: debouncedKeyword }),
    placeholderData: keepPreviousData,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockApi.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("用户已删除");
      setDeletingUser(null);
    },
    onError: (error) => toast.danger(error instanceof Error ? error.message : "删除失败"),
  });
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = query.data?.list ?? [];
  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };
  const openEdit = (user: UserListItem) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">用户管理</h2>
        <p className="mt-1 text-muted">管理工作区成员及其访问权限。</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField aria-label={t("搜索")} className="w-full sm:w-72" value={keyword} onChange={setKeyword}>
          <SearchField.Group>
            <SearchField.SearchIcon className="size-4 shrink-0 text-muted" />
            <SearchField.Input className="w-full" placeholder={t("搜索姓名或邮箱")} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Access permission="app:user:add">
          <Button className="w-full sm:w-auto" variant="primary" onPress={openCreate}>
            新增用户
          </Button>
        </Access>
      </div>
      {query.isError && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{query.error instanceof Error ? query.error.message : "用户列表加载失败"}</span>
          <Button size="sm" variant="ghost" onPress={() => void query.refetch()}>
            重试
          </Button>
        </div>
      )}
      <div className={query.isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="团队成员" className="min-w-[680px]">
              <Table.Header>
                <Table.Column isRowHeader>成员</Table.Column>
                <Table.Column>角色</Table.Column>
                <Table.Column>状态</Table.Column>
                <Table.Column>操作</Table.Column>
              </Table.Header>
              <Table.Body>
                {rows.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{user.role}</Table.Cell>
                    <Table.Cell>
                      <Chip color={statusColor[user.status as keyof typeof statusColor] ?? "default"} variant="soft">
                        <Chip.Label>{user.status}</Chip.Label>
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Access permission="app:user:edit">
                          <Button size="sm" variant="ghost" onPress={() => openEdit(user)}>
                            编辑
                          </Button>
                        </Access>
                        <Access permission="app:user:remove">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger"
                            onPress={() => setDeletingUser(user)}
                          >
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
        {!query.isFetching && !query.isError && rows.length === 0 && (
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
      <UserFormDialog
        user={editingUser}
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <AlertDialog.Backdrop isOpen={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-[calc(100vw-2rem)] sm:max-w-md">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>确认删除用户</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>删除后无法恢复。确定删除“{deletingUser?.name}”吗？</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" onPress={() => setDeletingUser(null)}>
                取消
              </Button>
              <Button
                isPending={deleteMutation.isPending}
                variant="danger"
                onPress={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              >
                删除
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
