import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import { EmployeeFilters } from "@/components/employees/EmployeeFilters";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { fetchEmployees } from "@/server/queries/employees";

const employmentTypeLabel = (value: string) => {
  switch (value) {
    case "FULL_TIME":
      return "常勤";
    case "CONTRACT":
      return "契約";
    default:
      return "パート";
  }
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; type?: string };
}) {
  const query = searchParams?.q ?? "";
  const status = searchParams?.status ?? "ALL";
  const employmentType = searchParams?.type ?? "ALL";
  const employees = await fetchEmployees({
    query,
    status,
    employmentType,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Employees</p>
          <h1 className="text-2xl font-semibold text-slate-900">従業員一覧</h1>
          <p className="text-sm text-slate-500">従業員マスター・契約ステータスの概要</p>
        </div>
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft"
        >
          <PlusCircleIcon className="h-5 w-5" /> 新規登録
        </Link>
      </div>

      <EmployeeFilters
        initialQuery={query}
        initialStatus={status}
        initialEmploymentType={employmentType}
      />

      <div className="section-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">従業員</th>
                <th className="px-4 py-3">雇用区分</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">部門</th>
                <th className="px-4 py-3">時給</th>
                <th className="px-4 py-3">契約期間</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{employee.name}</div>
                    <div className="text-xs text-slate-400">
                      #{employee.employeeNumber}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {employmentTypeLabel(employee.employmentType)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={employee.employmentStatus} />
                  </td>
                  <td className="px-4 py-4 text-sm">{employee.departmentCode}</td>
                  <td className="px-4 py-4 text-sm">
                    {formatCurrency(employee.hourlyWage)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {employee.contractStartDate ?? "-"} ~{" "}
                    {employee.contractEndDate ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-right text-sm">
                    <Link
                      className="text-accent-blue font-semibold"
                      href={`/employees/${employee.id}`}
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    該当する従業員はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
