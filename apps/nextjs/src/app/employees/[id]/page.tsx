import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PrinterIcon,
  PencilSquareIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { fetchEmployeeDetail } from "@/server/queries/employees";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const detail = await fetchEmployeeDetail(id);

  if (!detail.employee) {
    notFound();
  }

  const employee = detail.employee;

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
                  メールアドレス
                </p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  {employee.email || "未登録"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  電話番号
                </p>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  {employee.phoneNumber || "未登録"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  内線番号
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.extensionNumber || "-"}
                </p>
              </div>
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
              {employee.isManager && (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                  管理職
                </span>
              )}
              {employee.canWorkRemote && (
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                  テレワーク可
                </span>
              )}
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
          <button className="relative px-6 py-4 text-sm font-semibold text-slate-900 hover:bg-white transition-all after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-slate-900">
            基本情報
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
            勤務情報
          </button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 個人情報 */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-1 h-4 bg-slate-900 rounded-full mr-3" />
                  個人情報
                </h4>
                <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
                  <InfoRow label="氏名（姓）" value={employee.lastName || "-"} />
                  <InfoRow label="氏名（名）" value={employee.firstName || "-"} />
                  <InfoRow label="フリガナ" value={employee.nameKana} />
                  <InfoRow label="生年月日" value={employee.birthDate || "-"} />
                  <InfoRow label="性別" value={genderLabel(employee.gender)} />
                  <InfoRow label="国籍" value={employee.nationality || "日本"} />
                </div>
              </div>
            </div>

            {/* 連絡先情報 */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-1 h-4 bg-slate-900 rounded-full mr-3" />
                  連絡先情報
                </h4>
                <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
                  <InfoRow label="郵便番号" value={employee.postalCode || "-"} />
                  <InfoRow label="都道府県" value={employee.prefecture || "-"} />
                  <InfoRow label="市区町村" value={employee.city || "-"} />
                  <InfoRow label="番地・建物" value={employee.streetAddress || "-"} />
                  <InfoRow label="携帯電話" value={employee.phoneNumber || "-"} />
                  <InfoRow label="個人メール" value={employee.personalEmail || "-"} />
                </div>
              </div>
            </div>

            {/* 緊急連絡先 */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-1 h-4 bg-accent-rose rounded-full mr-3" />
                  緊急連絡先
                </h4>
                <div className="bg-red-50/30 border border-red-100 rounded-xl p-6 space-y-4">
                  <InfoRow label="氏名" value={employee.emergencyContactName || "-"} />
                  <InfoRow
                    label="続柄"
                    value={employee.emergencyContactRelation || "-"}
                  />
                  <InfoRow
                    label="電話番号"
                    value={employee.emergencyContactPhone || "-"}
                  />
                  <InfoRow label="住所" value={employee.emergencyContactAddress || "-"} />
                </div>
              </div>
            </div>

            {/* 雇用情報 */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-1 h-4 bg-accent-blue rounded-full mr-3" />
                  雇用情報
                </h4>
                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-6 space-y-4">
                  <InfoRow
                    label="雇用形態"
                    value={employmentTypeLabel(employee.employmentType)}
                  />
                  <InfoRow label="部門" value={employee.departmentCode} />
                  <InfoRow label="役職" value={employee.position || "-"} />
                  <InfoRow label="上長" value={employee.supervisorName || "-"} />
                </div>
              </div>
            </div>
          </div>

          {/* 勤務条件セクション */}
          {detail.workConditions.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                現在の勤務条件
              </h4>
              <div className="space-y-4">
                {detail.workConditions.slice(0, 1).map((condition) => (
                  <div
                    key={condition.id}
                    className="bg-slate-50 rounded-xl p-6 grid grid-cols-3 gap-6"
                  >
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        勤務時間
                      </p>
                      {condition.workingHours.map((slot, index) => (
                        <p key={index} className="text-sm text-slate-700">
                          {slot.start} ~ {slot.end}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        休憩時間
                      </p>
                      {condition.breakHours.length === 0 && (
                        <p className="text-sm text-slate-700">なし</p>
                      )}
                      {condition.breakHours.map((slot, index) => (
                        <p key={index} className="text-sm text-slate-700">
                          {slot.start} ~ {slot.end}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        勤務地
                      </p>
                      {condition.workLocations.map((location, index) => (
                        <p key={index} className="text-sm text-slate-700">
                          <MapPinIcon className="w-4 h-4 inline mr-1 text-slate-400" />
                          {location.location}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
