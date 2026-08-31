import { afterEach, describe, expect, it, vi } from "vitest";
import { mockApi } from "~/lib/mock-api";

afterEach(() => vi.unstubAllGlobals());

describe("mockApi", () => {
  it("serializes user list pagination and keyword", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ list: [], total: 0, page: 2, pageSize: 10 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await mockApi.users({ page: 2, pageSize: 10, keyword: "Ada Lovelace" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8787/mock-api/users?page=2&pageSize=10&keyword=Ada+Lovelace",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("uses the expected methods for CRUD requests", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true, user: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await mockApi.createUser({ name: "Test User", email: "test@example.com", role: "editor", status: "活跃" });
    await mockApi.updateUser("usr_100", { status: "停用" });
    await mockApi.deleteUser("usr_100");

    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(["POST", "PUT", "DELETE"]);
  });

  it("normalizes API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "该邮箱已存在", fieldErrors: { email: "邮箱重复" } }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      mockApi.register({ name: "Test User", email: "test@example.com", password: "123456" }),
    ).rejects.toMatchObject({ message: "该邮箱已存在", fieldErrors: { email: "邮箱重复" } });
  });
});
