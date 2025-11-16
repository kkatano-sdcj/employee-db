import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { fetchEmployees } from "@/server/queries/employees";
import { formatCurrency } from "@/lib/formatters";

const employmentTypeLabel = (value: string) => {
  switch (value) {
    case "FULL_TIME":
      return "正社員";
    case "CONTRACT":
      return "契約社員";
    default:
      return "パート";
  }
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const status = params?.status ?? "ALL";
  const employmentType = params?.type ?? "ALL";
  const employees = await fetchEmployees({
    query,
    status,
    employmentType,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">従業員一覧</h1>
          <p className="text-sm text-slate-500 mt-1">全従業員の管理と検索</p>
        </div>
        <Link
          href="/employees/new"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-soft hover-lift flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          新規従業員追加
        </Link>
      </div>

      {/* フィルターバー */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft p-6">
        <form className="flex flex-col lg:flex-row gap-4">
          {/* 検索 */}
          <div className="flex-1 relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="名前、社員番号、部門で検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* フィルターボタン群 */}
          <div className="flex gap-2">
            {/* 雇用区分 */}
            <select
              name="type"
              defaultValue={employmentType}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-all"
            >
              <option value="ALL">全ての雇用区分</option>
              <option value="FULL_TIME">正社員</option>
              <option value="CONTRACT">契約社員</option>
              <option value="PART_TIME">パート</option>
            </select>

            {/* ステータス */}
            <select
              name="status"
              defaultValue={status}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-all"
            >
              <option value="ALL">全てのステータス</option>
              <option value="ACTIVE">在職中</option>
              <option value="INACTIVE">退職済み</option>
              <option value="SUSPENDED">休職中</option>
            </select>

            {/* 検索ボタン */}
            <button
              type="submit"
              className="px-4 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              検索
            </button>

            {/* 詳細フィルター */}
            <button
              type="button"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              詳細
            </button>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all"
              title="エクスポート"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all"
              title="インポート"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* アクティブフィルター */}
        {(query || status !== "ALL" || employmentType !== "ALL") && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-slate-500">フィルター:</span>
            <div className="flex gap-2">
              {query && (
                <span className="px-3 py-1 bg-slate-100 text-xs font-medium rounded-full flex items-center gap-2">
                  検索: {query}
                  <Link href="/employees" className="hover:text-slate-700">
                    ✕
                  </Link>
                </span>
              )}
              {status !== "ALL" && (
                <span className="px-3 py-1 bg-slate-100 text-xs font-medium rounded-full flex items-center gap-2">
                  {status === "ACTIVE" ? "在職中" : status === "INACTIVE" ? "退職済み" : "休職中"}
                  <Link
                    href={`/employees?${query ? `q=${query}&` : ""}type=${employmentType}`}
                    className="hover:text-slate-700"
                  >
                    ✕
                  </Link>
                </span>
              )}
              {employmentType !== "ALL" && (
                <span className="px-3 py-1 bg-slate-100 text-xs font-medium rounded-full flex items-center gap-2">
                  {employmentType === "FULL_TIME"
                    ? "正社員"
                    : employmentType === "CONTRACT"
                    ? "契約社員"
                    : "パート"}
                  <Link
                    href={`/employees?${query ? `q=${query}&` : ""}status=${status}`}
                    className="hover:text-slate-700"
                  >
                    ✕
                  </Link>
                </span>
              )}
            </div>
            <Link href="/employees" className="text-xs text-accent-blue hover:text-accent-blue/80 ml-2">
              クリア
            </Link>
          </div>
        )}
      </div>

      {/* データテーブル */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  社員番号
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  氏名
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  部門
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  雇用区分
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  時給
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {employee.employeeNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-semibold">
                        {employee.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{employee.name}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{employee.departmentCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        employee.employmentType === "FULL_TIME"
                          ? "bg-blue-50 text-blue-700"
                          : employee.employmentType === "CONTRACT"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {employmentTypeLabel(employee.employmentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(employee.hourlyWage)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${
                        employee.employmentStatus === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : employee.employmentStatus === "INACTIVE"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          employee.employmentStatus === "ACTIVE"
                            ? "bg-emerald-500"
                            : employee.employmentStatus === "INACTIVE"
                            ? "bg-slate-400"
                            : "bg-amber-500"
                        }`}
                      />
                      {employee.employmentStatus === "ACTIVE"
                        ? "在職中"
                        : employee.employmentStatus === "INACTIVE"
                        ? "退職済み"
                        : "休職中"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="詳細"
                      >
                        <EyeIcon className="w-4 h-4 text-slate-400" />
                      </Link>
                      <Link
                        href={`/employees/${employee.id}/edit`}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="編集"
                      >
                        <PencilSquareIcon className="w-4 h-4 text-slate-400" />
                      </Link>
                      <button
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="削除"
                      >
                        <TrashIcon className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">該当する従業員はありません。</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              全 <span className="font-semibold text-slate-900">{employees.length}</span> 件中{" "}
              <span className="font-semibold text-slate-900">
                1-{Math.min(20, employees.length)}
              </span>{" "}
              件を表示
            </span>
            <select className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400">
              <option>20件</option>
              <option>50件</option>
              <option>100件</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              disabled
            >
              <ChevronLeftIcon className="w-4 h-4 text-slate-400" />
            </button>
            <button className="px-3 py-1 bg-slate-900 text-white text-sm font-medium rounded-lg">
              1
            </button>
            {employees.length > 20 && (
              <>
                <button className="px-3 py-1 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors">
                  2
                </button>
                {employees.length > 40 && (
                  <>
                    <button className="px-3 py-1 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors">
                      3
                    </button>
                    <span className="px-2 text-slate-400">...</span>
                  </>
                )}
              </>
            )}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}