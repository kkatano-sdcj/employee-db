import { notFound } from "next/navigation";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { fetchEmployeeDetail } from "@/server/queries/employees";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const detail = await fetchEmployeeDetail(params.id);

  if (!detail.employee) {
    notFound();
  }

  const employee = detail.employee;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Employee</p>
          <h1 className="text-3xl font-semibold text-slate-900">{employee.name}</h1>
          <p className="text-sm text-slate-500">
            #{employee.employeeNumber} / {employee.departmentCode}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={employee.employmentStatus} />
          <span className="text-sm text-slate-500">
            最終更新:{" "}
            {employee.updatedAt
              ? new Date(employee.updatedAt).toLocaleString("ja-JP")
              : "-"}
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="section-card lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">基本情報</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <dt className="text-xs text-slate-400">氏名（カナ）</dt>
              <dd className="text-slate-900">{employee.nameKana}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">性別</dt>
              <dd>{genderLabel(employee.gender)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">生年月日</dt>
              <dd>{employee.birthDate ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">国籍</dt>
              <dd>{employee.nationality ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">入社日</dt>
              <dd>{employee.hiredAt ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">マイナンバー</dt>
              <dd>
                {employee.myNumber ? employee.myNumber.replace(/.(?=.{4})/g, "●") : "-"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="section-card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">勤務概要</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>雇用区分: {employmentTypeLabel(employee.employmentType)}</p>
            <p>勤務状態: {statusLabel(employee.employmentStatus)}</p>
            <p>最新勤務条件: {detail.workConditions[0]?.effectiveFrom ?? "未設定"}</p>
            <p>現在契約件数: {detail.contracts.length} 件</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">勤務条件</h2>
        </div>
        <div className="space-y-4">
          {detail.workConditions.map((condition) => (
            <div key={condition.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <CalendarDaysIcon className="h-4 w-4" />{" "}
                  {condition.effectiveFrom ?? "-"} ~ {condition.effectiveTo ?? "継続"}
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  {condition.workDaysType} / {condition.workDaysCount}日
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    勤務時間帯
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {condition.workingHours.map((slot, index) => (
                      <li key={`${condition.id}-wh-${index}`}>
                        {slot.start} ~ {slot.end}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">休憩</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {condition.breakHours.length === 0 && <li>なし</li>}
                    {condition.breakHours.map((slot, index) => (
                      <li key={`${condition.id}-br-${index}`}>
                        {slot.start} ~ {slot.end}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    勤務場所 / 交通費
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    {condition.workLocations.map((location, index) => (
                      <p
                        key={`${condition.id}-loc-${index}`}
                        className="flex items-center gap-2"
                      >
                        <MapPinIcon className="h-4 w-4" /> {location.location}
                      </p>
                    ))}
                    {condition.transportationRoutes.map((route, index) => (
                      <div
                        key={`${condition.id}-route-${index}`}
                        className="rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs text-slate-400">{route.route}</p>
                        <p className="text-sm text-slate-600">
                          往復 {formatCurrency(route.roundTripAmount)} / 月額{" "}
                          {formatCurrency(route.monthlyPassAmount ?? 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {detail.workConditions.length === 0 && (
            <p className="text-center text-sm text-slate-500">
              勤務条件はまだ登録されていません。
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="section-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">雇用契約</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            {detail.contracts.map((contract) => (
              <div key={contract.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  {contract.contractType}
                </p>
                <p className="text-sm text-slate-600">
                  {contract.contractStartDate ?? "-"} ~{" "}
                  {contract.contractEndDate ?? "継続"}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(contract.hourlyWage)}
                </p>
                <p className="text-xs text-slate-400">
                  ステータス: {statusLabel(contract.status)}
                </p>
              </div>
            ))}
            {detail.contracts.length === 0 && (
              <p className="text-center text-sm text-slate-500">契約情報がありません。</p>
            )}
          </div>
        </div>
        <div className="section-card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">雇用・人事履歴</h2>
          <ol className="relative border-l border-slate-200 pl-4 text-sm text-slate-600">
            {detail.employmentHistory.map((event) => (
              <li key={event.id} className="mb-4 ml-4">
                <div className="absolute -left-1.5 h-3 w-3 rounded-full border border-white bg-slate-400" />
                <p className="text-xs text-slate-400">
                  {event.effectiveDate ?? "未設定"}
                </p>
                <p className="font-semibold text-slate-900">{event.eventType}</p>
                <p className="text-xs text-slate-500">{event.remarks ?? "-"}</p>
              </li>
            ))}
            {detail.employmentHistory.length === 0 && (
              <p className="py-4 text-sm text-slate-500">
                履歴はまだ登録されていません。
              </p>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}

const genderLabel = (value: string) => {
  switch (value) {
    case "MALE":
      return "男性";
    case "FEMALE":
      return "女性";
    default:
      return "その他";
  }
};

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
    case "ACTIVE":
      return "稼働";
    case "ON_LEAVE":
      return "休職";
    case "RETIRED":
      return "退職";
    case "SUBMITTED":
      return "提出済";
    case "AWAITING_APPROVAL":
      return "承認待ち";
    case "RETURNED":
      return "差戻し";
    default:
      return value;
  }
};
