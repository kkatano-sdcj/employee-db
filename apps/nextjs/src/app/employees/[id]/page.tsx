import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PrinterIcon,
  PencilSquareIcon,
  CameraIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { fetchEmployeeDetail } from "@/server/queries/employees";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export default async function EmployeeDetailPage({ params, searchParams }: EmployeeDetailPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams ?? {}]);
  const detail = await fetchEmployeeDetail(id);

  if (!detail.employee) {
    notFound();
  }

  const employee = detail.employee;

  const activeTab = resolvedSearchParams?.view === "work" ? "work" : "profile";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all hover-lift"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">従業員詳細</h2>
            <p className="text-sm text-slate-500 mt-1">
              従業員ID: {employee.employeeNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm hover-lift flex items-center gap-2">
            <PrinterIcon className="w-4 h-4" />
            印刷
          </button>
          <Link
            href={`/employees/${employee.id}/edit`}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-soft hover-lift flex items-center gap-2"
          >
            <PencilSquareIcon className="w-4 h-4" />
            編集モード
          </Link>
        </div>
      </div>

      {/* プロファイルヘッダーカード */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft p-8">
        <div className="flex items-start gap-8">
          {/* プロファイル写真 */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-36 h-36 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-glow">
                {employee.name.substring(0, 2)}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-soft hover:shadow-md transition-all">
                <CameraIcon className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  employee.employmentStatus === "ACTIVE"
                    ? "bg-accent-emerald/10 text-accent-emerald"
                    : employee.employmentStatus === "INACTIVE"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {employee.employmentStatus === "ACTIVE"
                  ? "在職中"
                  : employee.employmentStatus === "INACTIVE"
                    ? "退職済み"
                    : "休職中"}
              </span>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="flex-1">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-slate-900">{employee.name}</h3>
              <p className="text-lg text-slate-600 mt-2">
                {employee.departmentCode} / {employmentTypeLabel(employee.employmentType)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  入社日
                </p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {employee.hiredAt || "-"}
                  {employee.hiredAt && (
                    <span className="text-xs text-slate-500">
                      （{calculateYearsOfService(employee.hiredAt)}）
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                {employmentTypeLabel(employee.employmentType)}
              </span>
            </div>
          </div>

          {/* クイック統計 */}
          <div className="flex-shrink-0 space-y-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">98%</p>
              <p className="text-xs text-slate-500 mt-1">出勤率</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">15日</p>
              <p className="text-xs text-slate-500 mt-1">有給残日数</p>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-soft overflow-hidden">
        <nav className="flex border-b border-slate-200 bg-slate-50/30">
          <TabLink href={`/employees/${employee.id}`} label="基本情報" active={activeTab === "profile"} />
          <TabLink
            href={`/employees/${employee.id}?view=work`}
            label="勤務情報"
            active={activeTab === "work"}
          />
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            給与・手当
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            契約履歴
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            評価・スキル
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            書類
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            備考
          </button>
        </nav>

        {/* タブコンテンツ */}
        <div className="p-8">
          {activeTab === "profile" ? (
            <ProfileSection employee={employee} />
          ) : (
            <WorkSection detail={detail} />
          )}

          {/* アクションボタン */}
          <div className="flex justify-end gap-3 mt-8 pt-8 border-t border-slate-200">
            <Link
              href="/employees"
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm hover-lift"
            >
              戻る
            </Link>
            <Link
              href={`/employees/${employee.id}/edit`}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-soft hover-lift"
            >
              編集する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ヘルパーコンポーネント
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 gap-4 items-center">
    <label className="text-sm text-slate-600 font-medium">{label}</label>
    <div className="col-span-2">
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

const TabLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`px-6 py-4 text-sm font-semibold transition-all relative ${
      active
        ? "text-slate-900 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-slate-900"
        : "text-slate-600 hover:text-slate-900 hover:bg-white"
    }`}
  >
    {label}
  </Link>
);

const ProfileSection = ({
  employee,
}: {
  employee: NonNullable<Awaited<ReturnType<typeof fetchEmployeeDetail>>["employee"]>;
}) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-slate-900 rounded-full mr-3" />
          個人情報
        </h4>
        <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
          <InfoRow label="氏名" value={employee.name} />
          <InfoRow label="フリガナ" value={employee.nameKana} />
          <InfoRow label="生年月日" value={employee.birthDate || "-"} />
          <InfoRow label="性別" value={genderLabel(employee.gender)} />
          <InfoRow label="国籍" value={employee.nationality || "日本"} />
          <InfoRow label="個人番号" value={employee.myNumber || "-"} />
        </div>
      </div>
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-accent-blue rounded-full mr-3" />
          雇用情報
        </h4>
        <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-6 space-y-4">
          <InfoRow label="雇用形態" value={employmentTypeLabel(employee.employmentType)} />
          <InfoRow label="部門" value={employee.departmentCode} />
          <InfoRow label="従業員番号" value={employee.employeeNumber} />
          <InfoRow label="支店番号" value={String(employee.branchNumber)} />
          {employee.retiredAt && <InfoRow label="退職日" value={employee.retiredAt} />}
        </div>
      </div>
    </div>
  </div>
);

const WorkSection = ({
  detail,
}: {
  detail: Awaited<ReturnType<typeof fetchEmployeeDetail>>;
}) => (
  <div className="space-y-8">
    {detail.workConditions.length === 0 ? (
      <p className="text-sm text-slate-500">勤務条件はまだ登録されていません。</p>
    ) : (
      detail.workConditions.map((condition, index) => (
        <div key={condition.id} className="border border-slate-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">勤務条件 #{index + 1}</p>
              <p className="text-sm text-slate-600">
                {condition.effectiveFrom} ~ {condition.effectiveTo ?? "継続"}
              </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
              {condition.workDaysType} / {condition.workDaysCount}日
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">勤務時間</p>
              {condition.workingHours.map((slot, idx) => (
                <p key={`${condition.id}-wh-${idx}`} className="text-sm text-slate-700">
                  {slot.start} ~ {slot.end}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">休憩</p>
              {condition.breakHours.length === 0 && <p className="text-sm text-slate-700">なし</p>}
              {condition.breakHours.map((slot, idx) => (
                <p key={`${condition.id}-br-${idx}`} className="text-sm text-slate-700">
                  {slot.start} ~ {slot.end}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">勤務場所</p>
              {condition.workLocations.map((location, idx) => (
                <p key={`${condition.id}-loc-${idx}`} className="text-sm text-slate-700">
                  <MapPinIcon className="w-4 h-4 inline mr-1 text-slate-400" />
                  {location.location}
                </p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">交通費ルート</p>
              {condition.transportationRoutes.length === 0 && (
                <p className="text-sm text-slate-700">登録なし</p>
              )}
              {condition.transportationRoutes.map((route) => (
                <div key={route.route} className="text-sm text-slate-700">
                  {route.route} / 往復 ¥{route.roundTripAmount}
                  {route.monthlyPassAmount && <span> ・定期 ¥{route.monthlyPassAmount}</span>}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">有休基準日・メモ</p>
              <p className="text-sm text-slate-700">
                {condition.paidLeaveBaseDate ?? "未設定"} / {condition.workDaysCountNote ?? ""}
              </p>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

// ヘルパー関数
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
      return "正社員";
    case "CONTRACT":
      return "契約社員";
    default:
      return "パート";
  }
};

const calculateYearsOfService = (hireDate: string) => {
  const hire = new Date(hireDate);
  const now = new Date();
  const years = now.getFullYear() - hire.getFullYear();
  const months = now.getMonth() - hire.getMonth();

  if (years === 0) {
    return `${months}ヶ月`;
  } else if (months < 0) {
    return `${years - 1}年${12 + months}ヶ月`;
  } else {
    return `${years}年${months}ヶ月`;
  }
};
