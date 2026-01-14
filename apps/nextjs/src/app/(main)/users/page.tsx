import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { fetchUsers, roleLabels, roleColors, type UserRole } from "@/server/queries/users";
import { UserRoleSelect } from "@/components/users/UserRoleSelect";
import { DeleteUserButton } from "@/components/users/DeleteUserButton";
import { UserSearchForm } from "@/components/users/UserSearchForm";
import {
  UsersIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface UsersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const searchQuery = params.search || "";

  // セッションを取得して権限チェック
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;

  // ADMIN と SYSTEM_ADMIN のみアクセス可能
  if (userRole !== "ADMIN" && userRole !== "SYSTEM_ADMIN") {
    redirect("/");
  }

  const { users, totalCount, totalPages } = await fetchUsers(currentPage, searchQuery);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">User Management</p>
          <h1 className="text-2xl font-bold text-slate-900">ユーザー管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            システムユーザーの一覧と権限管理
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <UsersIcon className="w-5 h-5" />
          <span>{totalCount} ユーザー</span>
        </div>
      </div>

      {/* 検索フォーム */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft p-4">
        <UserSearchForm initialSearch={searchQuery} />
      </div>

      {/* 権限の説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">権限について</h3>
            <p className="text-xs text-blue-700 mt-1">
              このページではユーザーのロールを変更できます。FIELD_MANAGERロールのユーザーには部門コードの設定が必要です。
            </p>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  部門コード
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.name || "名前未設定"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      currentDepartmentCode={user.departmentCode}
                      currentUserRole={userRole as UserRole}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {user.departmentCode || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteUserButton
                      userId={user.id}
                      userName={user.name || user.email}
                      currentUserId={session.user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">ユーザーが見つかりません</p>
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              {totalCount} 件中 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalCount)} 件を表示
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/users?page=${currentPage - 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  前のページ
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed">
                  <ChevronLeftIcon className="w-4 h-4" />
                  前のページ
                </span>
              )}

              <span className="px-3 py-2 text-sm text-slate-600">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/users?page=${currentPage + 1}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  次へ
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed">
                  次へ
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ロールの説明 */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">ロールの説明</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(roleLabels) as [UserRole, string][]).map(([role, label]) => (
            <div key={role} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${roleColors[role]}`}>
                {role}
              </span>
              <span className="text-sm text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
