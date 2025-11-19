import type { ReactNode } from "react";

import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyYenIcon,
} from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

import { fetchDashboardMetrics } from "@/server/queries/dashboard";
import type { EmployeeListItem } from "@/server/queries/employees";

const formatter = new Intl.NumberFormat("ja-JP");

export default async function DashboardPage() {
  const metrics = await fetchDashboardMetrics();
  const contractCompletionRate = Math.min(
    Math.round((metrics.contractProgress.processedThisMonth / metrics.contractProgress.target) * 100) || 0,
    100,
  );

  return (
    <div className="space-y-8">
      {/* KPIメトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="総従業員数"
          value={metrics.totals.employees}
          change="+4.9%"
          changeLabel="前月比 12名増加"
          icon={<UsersIcon className="w-6 h-6 text-accent-blue" />}
          bgColor="from-accent-blue/10 to-accent-blue/5"
          changeType="positive"
        />
        <KpiCard
          label="今月の契約処理"
          value={metrics.contractProgress.processedThisMonth}
          change={`${contractCompletionRate}%`}
          changeLabel={`目標 ${metrics.contractProgress.target}件`}
          icon={<DocumentTextIcon className="w-6 h-6 text-accent-emerald" />}
          bgColor="from-accent-emerald/10 to-accent-emerald/5"
          changeType="positive"
        />
        <KpiCard
          label="契約更新予定"
          value={metrics.totals.expiringContracts}
          change="要対応"
          changeLabel="3日以内に期限"
          icon={<ClockIcon className="w-6 h-6 text-accent-amber" />}
          bgColor="from-accent-amber/10 to-accent-amber/5"
          changeType="warning"
        />
        <KpiCard
          label="月額給与総額"
          value={`¥${formatter.format(Math.round(metrics.payroll.monthlyTotal))}`}
          change=""
          changeLabel="稼働中の契約ベース"
          icon={<CurrencyYenIcon className="w-6 h-6 text-accent-violet" />}
          bgColor="from-accent-violet/10 to-accent-violet/5"
          changeType="positive"
        />
      </div>

      {/* チャートセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 部門別従業員分布 */}
        <div className="lg:col-span-2 section-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">部門別従業員分布</h3>
              <p className="text-sm text-slate-500 mt-1">2024年11月時点</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
              <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white shadow-sm text-slate-900 transition-all">
                月次
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all">
                四半期
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 transition-all">
                年次
              </button>
            </div>
          </div>
          <DepartmentChart stats={metrics.departmentStats} />
        </div>

        {/* 契約処理進捗 */}
        <div className="section-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">契約処理進捗</h3>
          <ProgressIndicator
            processed={metrics.contractProgress.processedThisMonth}
            backlog={metrics.contractProgress.backlog}
            target={metrics.contractProgress.target}
          />
        </div>
      </div>

      {/* タスクテーブル */}
      <div className="section-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">本日の重要タスク</h3>
              <p className="text-sm text-slate-500 mt-1">優先度順に表示</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                フィルタ
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                エクスポート
              </button>
            </div>
          </div>
        </div>
        <TaskTable employees={metrics.latestEmployees} />
      </div>
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string | number;
  change: string;
  changeLabel: string;
  icon: ReactNode;
  bgColor: string;
  changeType: "positive" | "warning";
};

const KpiCard = ({
  label,
  value,
  change,
  changeLabel,
  icon,
  bgColor,
  changeType,
}: KpiCardProps) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-soft hover-lift group">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 bg-gradient-to-br ${bgColor} rounded-xl group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          changeType === "positive"
            ? "text-accent-emerald bg-accent-emerald/10"
            : "text-accent-amber bg-accent-amber/10"
        }`}
      >
        {change}
      </span>
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1">
      {typeof value === "number" ? formatter.format(value) : value}
    </h3>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    <div className="mt-4 flex items-center text-xs text-slate-400">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={
            changeType === "positive"
              ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          }
        />
      </svg>
      {changeLabel}
    </div>
  </div>
);

const DepartmentChart = ({
  stats,
}: {
  stats: Array<{ departmentCode: string; count: number }>;
}) => {
  const labelMap: Record<string, string> = {
    BPS: "BPS課",
    ONSITE: "オンサイト課",
    CC: "CC課",
    PS: "PS課",
  };

  const chartData = (stats.length ? stats : [{ departmentCode: "未設定", count: 0 }]).map(
    (item, index) => ({
      name: labelMap[item.departmentCode] ?? item.departmentCode ?? "未設定",
      count: item.count,
      color: [
        "from-accent-blue to-accent-blue/70",
        "from-accent-emerald to-accent-emerald/70",
        "from-accent-amber to-accent-amber/70",
        "from-accent-rose to-accent-rose/70",
        "from-accent-violet to-accent-violet/70",
      ][index % 5],
    }),
  );

  const maxCount = Math.max(...chartData.map((item) => item.count || 1), 1);

  return (
    <div className="h-64 flex items-end justify-between gap-4">
      {chartData.map((dept) => (
        <div key={dept.name} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full bg-gradient-to-t ${dept.color} rounded-t-lg hover:opacity-90 transition-opacity cursor-pointer`}
            style={{ height: `${Math.max((dept.count / maxCount) * 80, 10)}%` }}
          />
          <span className="text-xs text-slate-600 font-medium mt-3">{dept.name}</span>
          <span className="text-lg font-bold text-slate-900">{dept.count}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressIndicator = ({
  processed,
  backlog,
  target,
}: {
  processed: number;
  backlog: number;
  target: number;
}) => {
  const completionRate = Math.min(Math.round((processed / target) * 100), 100);
  const remaining = Math.max(target - processed, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-6">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-slate-100"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray="440"
            strokeDashoffset={440 - (440 * completionRate) / 100}
            className="text-accent-emerald transition-all duration-1000"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900">{completionRate}%</span>
          <span className="text-xs text-slate-500 font-medium">完了率</span>
        </div>
      </div>
      <div className="w-full space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">処理済み</span>
          <span className="font-bold text-slate-900">{processed}件</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">残り</span>
          <span className="font-bold text-slate-900">{remaining}件</span>
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">月間目標</span>
            <span className="font-bold text-accent-emerald">{target}件</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>バックログ</span>
            <span>{backlog}件</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskTable = ({ employees }: { employees: EmployeeListItem[] }) => {
  const indicatorColors = ["bg-accent-rose", "bg-accent-amber", "bg-accent-emerald"];
  const priorityBadges: Array<{ label: string; className: string }> = [
    { label: "高", className: "bg-red-50 text-red-700 border border-red-200" },
    { label: "中", className: "bg-amber-50 text-amber-700 border border-amber-200" },
    { label: "低", className: "bg-slate-100 text-slate-700 border border-slate-200" },
  ];
  const statusBadges = ["進行中", "準備中", "レビュー待ち"];

  const rows =
    employees.length > 0
      ? employees.slice(0, 4).map((employee, index) => {
          const overdue = employee.needsContractUpdate;
          return {
            task: `${employee.name} の契約更新`,
            assignee: employee.name,
            initial: employee.name.charAt(0),
            dueDate:
              employee.employmentExpiryScheduledDate ??
              employee.contractEndDate ??
              "未設定",
            priority: priorityBadges[index % priorityBadges.length],
            status: overdue ? "要更新" : statusBadges[index % statusBadges.length],
            indicatorColor: overdue ? indicatorColors[0] : indicatorColors[index % indicatorColors.length],
          };
        })
      : [
          {
            task: "田中太郎の契約更新",
            assignee: "山田花子",
            initial: "山",
            dueDate: "2024/11/08",
            priority: priorityBadges[0],
            status: statusBadges[0],
            indicatorColor: indicatorColors[0],
          },
          {
            task: "新入社員オリエンテーション",
            assignee: "佐藤次郎",
            initial: "佐",
            dueDate: "2024/11/10",
            priority: priorityBadges[1],
            status: statusBadges[1],
            indicatorColor: indicatorColors[1],
          },
        ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              タスク
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              担当者
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              期限
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              優先度
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              ステータス
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr
              key={`${row.task}-${index}`}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${row.indicatorColor}`} />
                  <span className="text-sm font-medium text-slate-900">{row.task}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold mr-2">
                    {row.initial}
                  </div>
                  <span className="text-sm text-slate-600">{row.assignee}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{row.dueDate}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${row.priority.className}`}
                >
                  {row.priority.label}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <EllipsisVerticalIcon className="w-4 h-4 text-slate-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
