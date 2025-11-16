import type { ReactNode } from "react";

import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { ArrowTrendingUpIcon, UsersIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";

import { StatusBadge } from "@/components/ui/status-badge";
import { fetchDashboardMetrics } from "@/server/queries/dashboard";

const formatter = new Intl.NumberFormat("ja-JP");

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="登録従業員"
          value={`${formatter.format(metrics.totals.employees)}名`}
          description="全雇用区分"
          accent="bg-gradient-to-r from-blue-500 to-indigo-500"
          icon={<UsersIcon className="h-6 w-6 text-white" />}
        />
        <KpiCard
          label="稼働中"
          value={`${formatter.format(metrics.totals.activeEmployees)}名`}
          description="勤務中の従業員"
          accent="bg-gradient-to-r from-emerald-500 to-teal-500"
          icon={<ArrowTrendingUpIcon className="h-6 w-6 text-white" />}
        />
        <KpiCard
          label="更新期限60日以内"
          value={`${metrics.totals.expiringContracts}件`}
          description="契約満了が近いケース"
          accent="bg-gradient-to-r from-amber-500 to-orange-500"
          icon={<ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />}
        />
        <KpiCard
          label="アラート"
          value={`${metrics.totals.alerts}件`}
          description="要注意の契約"
          accent="bg-gradient-to-r from-rose-500 to-pink-500"
          icon={<BellAlertIcon className="h-6 w-6 text-white" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="section-card col-span-2">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">最新更新</p>
              <h2 className="text-xl font-semibold text-slate-900">従業員のステータス</h2>
            </div>
            <span className="text-xs text-slate-400">
              {format(new Date(), "yyyy/MM/dd HH:mm", { locale: ja })}
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">従業員</th>
                  <th className="px-3 py-2">雇用区分</th>
                  <th className="px-3 py-2">状態</th>
                  <th className="px-3 py-2">部門</th>
                  <th className="px-3 py-2">契約期間</th>
                </tr>
              </thead>
              <tbody>
                {metrics.latestEmployees.map((employee) => (
                  <tr key={employee.id} className="border-t border-slate-100">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900">{employee.name}</div>
                      <div className="text-xs text-slate-400">
                        #{employee.employeeNumber}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {employmentTypeLabel(employee.employmentType)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={employee.employmentStatus} />
                    </td>
                    <td className="px-3 py-3 text-sm">{employee.departmentCode}</td>
                    <td className="px-3 py-3 text-sm">
                      {employee.contractStartDate ?? "-"} ~{" "}
                      {employee.contractEndDate ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">Renewal</p>
            <h2 className="text-xl font-semibold text-slate-900">契約更新パイプライン</h2>
          </header>
          <div className="space-y-4">
            {metrics.renewalPipeline.map((entry) => (
              <div
                key={entry.contractId}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-400">{entry.departmentCode}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-900">
                    {entry.contractEndDate ?? "未設定"}
                  </p>
                  <p className="text-xs text-slate-400">{statusLabel(entry.status)}</p>
                </div>
              </div>
            ))}
            {metrics.renewalPipeline.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                契約更新予定はありません。
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

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

const statusLabel = (value: string) => {
  switch (value) {
    case "SUBMITTED":
      return "提出済";
    case "AWAITING_APPROVAL":
      return "承認待ち";
    case "RETURNED":
      return "差戻し";
    default:
      return "下書き";
  }
};

type KpiCardProps = {
  label: string;
  value: string;
  description: string;
  accent: string;
  icon: ReactNode;
};

const KpiCard = ({ label, value, description, accent, icon }: KpiCardProps) => (
  <div className="stat-card relative overflow-hidden rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-soft">
    <div className="mb-6 flex items-center gap-3">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} text-white shadow-lg`}
      >
        {icon}
      </div>
      <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </div>
);
