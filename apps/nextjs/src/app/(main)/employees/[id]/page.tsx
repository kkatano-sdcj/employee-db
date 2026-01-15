import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PrinterIcon,
  PencilSquareIcon,
  CameraIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { fetchEmployeeDetail } from "@/server/queries/employees";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export default async function EmployeeDetailPage({ params, searchParams }: EmployeeDetailPageProps) {
  const id = (await params).id;
  const resolvedSearchParams = (searchParams ? await searchParams : undefined) as
    | { view?: string }
    | undefined;
  const detail = await fetchEmployeeDetail(id);

  if (!detail.employee) {
    notFound();
  }

  const employee = detail.employee;
  const primaryContract = detail.contracts[0];

  const viewParam = resolvedSearchParams?.view;
  const activeTab =
    viewParam === "work"
      ? "work"
      : viewParam === "salary"
        ? "salary"
        : viewParam === "contracts"
          ? "contracts"
          : viewParam === "documents"
            ? "documents"
            : viewParam === "notes"
              ? "notes"
              : "profile";

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
              社員コード: {employee.employeeNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {primaryContract ? (
            <>
              <Link
                href={`/api/pdf/contracts/${primaryContract.id}?type=contract&format=formatted`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm hover-lift flex items-center gap-2"
              >
                <PrinterIcon className="w-4 h-4" />
                雇用契約書PDF
              </Link>
              <Link
                href={`/api/pdf/contracts/${primaryContract.id}?type=pledge&format=formatted`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm hover-lift flex items-center gap-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                誓約書PDF
              </Link>
            </>
          ) : (
            <button
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-400 text-sm font-medium rounded-xl"
              disabled
            >
              PDF出力不可
            </button>
          )}
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
                    : employee.employmentStatus === "RETIRED"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {employmentStatusLabel(employee.employmentStatus)}
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
          <TabLink
            href={`/employees/${employee.id}?view=salary`}
            label="給与・手当"
            active={activeTab === "salary"}
          />
          <TabLink
            href={`/employees/${employee.id}?view=contracts`}
            label="契約履歴"
            active={activeTab === "contracts"}
          />
          <TabLink
            href={`/employees/${employee.id}?view=documents`}
            label="書類"
            active={activeTab === "documents"}
          />
          <TabLink
            href={`/employees/${employee.id}?view=notes`}
            label="備考"
            active={activeTab === "notes"}
          />
        </nav>

        {/* タブコンテンツ */}
        <div className="p-8">
          {activeTab === "profile" && (
            <ProfileSection
              employee={employee}
              contact={detail.contact}
              contract={detail.contracts.length > 0 ? detail.contracts[0] : undefined}
            />
          )}
          {activeTab === "work" && <WorkSection detail={detail} />}
          {activeTab === "salary" && (
            <SalarySection
              contract={detail.contracts.length > 0 ? detail.contracts[0] : undefined}
              adminRecord={detail.adminRecord}
              bankAccounts={detail.bankAccounts}
              workConditions={detail.workConditions}
            />
          )}
          {activeTab === "contracts" && (
            <ContractsSection
              contracts={detail.contracts}
              employmentHistory={detail.employmentHistory}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsSection adminRecord={detail.adminRecord} />
          )}
          {activeTab === "notes" && <NotesSection employee={employee} contracts={detail.contracts} />}

          <div className="flex justify-end gap-3 mt-8 pt-8 border-t border-slate-200">
            <Link
              href="/employees"
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm hover-lift"
            >
              戻る
            </Link>
            <Link
              href={
                activeTab === "salary" || activeTab === "contracts" || activeTab === "notes"
                  ? `/employees/${employee.id}/edit?source=contract`
                  : `/employees/${employee.id}/edit`
              }
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

type EmployeeDetailResponse = Awaited<ReturnType<typeof fetchEmployeeDetail>>;

const ProfileSection = ({
  employee,
  contact,
  contract,
}: {
  employee: NonNullable<EmployeeDetailResponse["employee"]>;
  contact: EmployeeDetailResponse["contact"];
  contract?: EmployeeDetailResponse["contracts"][number];
}) => (
  <div className="space-y-8">
    {/* 雇用情報セクション */}
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
        <span className="w-1 h-4 bg-accent-blue rounded-full mr-3" />
        雇用情報
      </h4>
      <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-6 space-y-4">
        <InfoRow label="社員コード" value={employee.employeeNumber} />
        <InfoRow label="氏名" value={employee.name} />
        <InfoRow label="氏名フリガナ" value={employee.nameKana} />
        <InfoRow label="フセン項目" value={employee.stickerItem ?? "-"} />
        <InfoRow label="性別" value={genderLabel(employee.gender)} />
        <InfoRow label="生年月日" value={employee.birthDate ?? "-"} />
        <InfoRow label="部門" value={employee.departmentCode} />
        <InfoRow label="契約番号" value={contract?.id ?? "-"} />
        <InfoRow label="入社日" value={employee.hiredAt ?? "-"} />
        <InfoRow label="再入社日" value={employee.rehiredAt ?? "-"} />
        <InfoRow
          label="雇用期間"
          value={`${contract?.contractStartDate ?? "-"} ~ ${contract?.employmentExpiryScheduledDate ?? "継続"}`}
        />
        <InfoRow label="退社日" value={employee.retiredAt ?? "-"} />
      </div>
    </div>

    {/* 住所・連絡先セクション */}
    <div className="space-y-6">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
        <span className="w-1 h-4 bg-accent-emerald rounded-full mr-3" />
        住所・連絡先（住民票住所）
      </h4>
      <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-6 space-y-4">
        <InfoRow label="郵便番号" value={contact?.postalCode ?? "-"} />
        <InfoRow label="住所1" value={contact?.address1 ?? "-"} />
        <InfoRow label="住所2" value={contact?.address2 ?? "-"} />
        <InfoRow label="住所1フリガナ" value={contact?.address1Kana ?? "-"} />
        <InfoRow label="住所2フリガナ" value={contact?.address2Kana ?? "-"} />
        <InfoRow label="電話番号（個人用）" value={contact?.phone1 ?? "-"} />
        <InfoRow label="メールアドレス（個人用）" value={contact?.email1 ?? "-"} />
      </div>
    </div>
  </div>
);

const WorkSection = ({
  detail,
}: {
  detail: Awaited<ReturnType<typeof fetchEmployeeDetail>>;
}) => {
  const primaryContract = detail.contracts[0];
  const primaryWorkCondition = detail.workConditions[0];

  if (!primaryWorkCondition) {
    return <p className="text-sm text-slate-500">勤務条件はまだ登録されていません。</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
        <InfoRow
          label="契約書有給"
          value={primaryContract?.paidLeaveClause ?? "-"}
        />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">勤務時間</p>
          {primaryWorkCondition.workingHours.length === 0 ? (
            <p className="text-sm text-slate-700">未設定</p>
          ) : (
            primaryWorkCondition.workingHours.map((slot, idx) => (
              <p key={`wh-${idx}`} className="text-sm text-slate-700">
                {slot.start} ~ {slot.end}
              </p>
            ))
          )}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">休憩時間</p>
          {primaryWorkCondition.breakHours.length === 0 ? (
            <p className="text-sm text-slate-700">なし</p>
          ) : (
            primaryWorkCondition.breakHours.map((slot, idx) => (
              <p key={`br-${idx}`} className="text-sm text-slate-700">
                {slot.start} ~ {slot.end}
              </p>
            ))
          )}
        </div>
        <InfoRow
          label="勤務日数/週"
          value={`${primaryWorkCondition.workDaysType === "WEEKLY" ? "週" : primaryWorkCondition.workDaysType === "MONTHLY" ? "月" : "シフト"} ${primaryWorkCondition.workDaysCount}${primaryWorkCondition.workDaysCountNote ? `（${primaryWorkCondition.workDaysCountNote}）` : ""}`}
        />
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">勤務場所</p>
          {primaryWorkCondition.workLocations.length === 0 ? (
            <p className="text-sm text-slate-700">未設定</p>
          ) : (
            primaryWorkCondition.workLocations.map((location, idx) => (
              <p key={`loc-${idx}`} className="text-sm text-slate-700">
                <MapPinIcon className="w-4 h-4 inline mr-1 text-slate-400" />
                {location.location}
              </p>
            ))
          )}
        </div>
        <InfoRow
          label="業務内容"
          value={primaryContract?.jobDescription ?? "-"}
        />
      </div>
    </div>
  );
};

const SalarySection = ({
  contract,
  adminRecord,
  bankAccounts,
  workConditions,
}: {
  contract?: EmployeeDetailResponse["contracts"][number];
  adminRecord: EmployeeDetailResponse["adminRecord"];
  bankAccounts: EmployeeDetailResponse["bankAccounts"];
  workConditions: EmployeeDetailResponse["workConditions"];
}) => {
  const currencyFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });

  const primaryRoute =
    workConditions.find((condition) => condition.transportationRoutes.length > 0)?.transportationRoutes[0];

  const formatCurrency = (value?: number | null) =>
    value !== undefined && value !== null ? currencyFormatter.format(value) : "-";

  const formatFlag = (value?: string | null) => {
    if (!value) return "-";
    if (value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "y") {
      return "加入";
    }
    if (value.toLowerCase() === "false" || value === "0" || value.toLowerCase() === "n") {
      return "未加入";
    }
    return value;
  };

  const depositTypeLabel = (value?: string) => {
    switch (value) {
      case "SAVINGS":
        return "普通";
      case "CHECKING":
        return "当座";
      case "OTHER":
        return "その他";
      default:
        return value ?? "-";
    }
  };

  return (
    <div className="space-y-8">
      {/* 基本給与情報 */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-accent-blue rounded-full mr-3" />
          給与情報
        </h4>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
          <InfoRow label="基本給" value={formatCurrency(adminRecord?.baseSalary)} />
          <InfoRow label="時給単価" value={formatCurrency(contract?.hourlyWage)} />
          <InfoRow label="残業時給" value={formatCurrency(contract?.overtimeHourlyWage ?? null)} />
          <InfoRow label="日払い支給額" value={formatCurrency(adminRecord?.dailyPaymentAmount)} />
          <InfoRow label="通勤費区分" value={adminRecord?.commutingExpenseCategory ?? "-"} />
          <InfoRow label="通勤費支払方法" value={adminRecord?.commutingExpensePaymentMethod ?? "-"} />
          <InfoRow label="最寄り駅" value={primaryRoute?.nearestStation ?? "-"} />
          <InfoRow
            label="交通費（片道/往復）"
            value={
              primaryRoute
                ? `往復 ${formatCurrency(primaryRoute.roundTripAmount)}${primaryRoute.monthlyPassAmount ? ` / 定期 ${formatCurrency(primaryRoute.monthlyPassAmount)}` : ""}`
                : "-"
            }
          />
        </div>
      </div>

      {/* 振込口座情報 */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-accent-emerald rounded-full mr-3" />
          振込口座情報
        </h4>
        {bankAccounts.length === 0 ? (
          <p className="text-sm text-slate-500">振込口座はまだ登録されていません。</p>
        ) : (
          bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  給与支払{account.paymentPriority}
                </span>
                {!account.isActive && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                    無効
                  </span>
                )}
              </div>
              <InfoRow label="支払順位" value={String(account.paymentPriority)} />
              <InfoRow label="取扱区分" value={account.handlingCategory ?? "-"} />
              <InfoRow label="支払区分" value={account.paymentCategory ?? "-"} />
              <InfoRow label="振込機関コード" value={account.bankCode ?? "-"} />
              <InfoRow label="機関名" value={account.bankName ?? "-"} />
              <InfoRow label="支店名" value={account.branchName ?? "-"} />
              <InfoRow label="預金種目" value={depositTypeLabel(account.depositType)} />
              <InfoRow label="口座番号" value={account.accountNumber ?? "-"} />
              <InfoRow label="口座名" value={account.accountHolderName ?? "-"} />
            </div>
          ))
        )}
      </div>

      {/* 社会保険・雇用保険情報 */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-1 h-4 bg-amber-500 rounded-full mr-3" />
          社会保険・雇用保険
        </h4>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
          <InfoRow label="控除申告書（甲乙）" value={adminRecord?.taxWithholdingCategory ?? "-"} />
          <InfoRow
            label="web給金帳"
            value={adminRecord?.webSalaryBookEnabled ? "有効" : "無効"}
          />
          <InfoRow label="健康保険加入区分" value={adminRecord?.healthInsuranceCategory ?? "-"} />
          <InfoRow label="健康保険証の種類" value={adminRecord?.healthInsuranceCardType ?? "-"} />
          <InfoRow label="厚生年金加入区分" value={adminRecord?.pensionCategory ?? "-"} />
          <InfoRow label="基礎年金番号" value={adminRecord?.basicPensionNumber ?? "-"} />
          <InfoRow label="厚年基金加入区分" value={adminRecord?.pensionFundCategory ?? "-"} />
          <InfoRow label="雇用保険（加入/未加入）" value={formatFlag(adminRecord?.employmentInsurance)} />
          <InfoRow label="雇用保険被保険者番号" value={adminRecord?.employmentInsuranceNumber ?? "-"} />
          <InfoRow
            label="雇用保険証提出"
            value={adminRecord?.employmentInsuranceCardSubmitted ?? "-"}
          />
          <InfoRow label="社会保険（加入/未加入）" value={formatFlag(adminRecord?.socialInsurance)} />
        </div>
      </div>
    </div>
  );
};

const ContractsSection = ({
  contracts,
  employmentHistory,
}: {
  contracts: EmployeeDetailResponse["contracts"];
  employmentHistory: EmployeeDetailResponse["employmentHistory"];
}) => {
  // 契約IDごとの最新の承認番号を取得
  const getApprovalNumber = (contractId: string) => {
    const history = employmentHistory.find((h) => h.contractId === contractId);
    return history?.approvalNumber || null;
  };

  return (
    <div className="space-y-6">
      {contracts.length === 0 ? (
        <p className="text-sm text-slate-500">契約履歴がありません。</p>
      ) : (
        contracts.map((contract) => {
          const approvalNumber = getApprovalNumber(contract.id);
          return (
            <div key={contract.id} className="border border-slate-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">契約番号</p>
                  <p className="text-lg font-semibold text-slate-900">{contract.id}</p>
                  {approvalNumber && (
                    <>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-2">承認番号</p>
                      <p className="text-sm font-medium text-slate-700">{approvalNumber}</p>
                    </>
                  )}
                </div>
            <div className="flex items-center gap-2">
              {contract.needsUpdate && (
                <span className="px-3 py-1 text-xs rounded-full bg-rose-50 text-rose-600 font-semibold">
                  要更新
                </span>
              )}
              <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                {contract.status}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="契約タイプ" value={contract.contractType === "FIXED_TERM" ? "有期" : "無期"} />
            <InfoRow
              label="契約期間"
              value={`${
                contract.contractStartDate ?? "-"
              } ~ ${contract.employmentExpiryScheduledDate ?? "継続"}${
                contract.employmentExpiryDate ? `（実満了: ${contract.employmentExpiryDate}）` : ""
              }`}
            />
            <InfoRow label="時給単価" value={`¥${contract.hourlyWage.toLocaleString()}`} />
            <InfoRow
              label="残業時給"
              value={contract.overtimeHourlyWage ? `¥${contract.overtimeHourlyWage.toLocaleString()}` : "-"}
            />
            <InfoRow label="業務内容" value={contract.jobDescription ?? "-"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/api/pdf/contracts/${contract.id}?type=contract&format=formatted`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <PrinterIcon className="h-4 w-4" /> 雇用契約書PDF
            </Link>
            <Link
              href={`/api/pdf/contracts/${contract.id}?type=pledge&format=formatted`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <DocumentTextIcon className="h-4 w-4" /> 誓約書PDF
            </Link>
          </div>
        </div>
          );
        })
      )}
    </div>
  );
};

const DocumentsSection = ({
  adminRecord,
}: {
  adminRecord: EmployeeDetailResponse["adminRecord"];
}) => (
  <div className="space-y-6">
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
      <InfoRow
        label="保険証授"
        value={adminRecord?.healthInsuranceCardSubmitted ?? "-"}
      />
      <InfoRow
        label="雇用契約書他管理へ提出(日付)"
        value={adminRecord?.submittedToAdminOn ?? "-"}
      />
      <InfoRow label="本人へ返却" value={adminRecord?.returnedToEmployee ?? "-"} />
      <InfoRow
        label="満了通知書発効"
        value={adminRecord?.expirationNoticeIssued ?? "-"}
      />
      <InfoRow
        label="退職届提出"
        value={adminRecord?.resignationLetterSubmitted ?? "-"}
      />
      <div className="pt-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">返却</p>
        <div className="pl-4 space-y-2">
          <InfoRow
            label="保険証"
            value={adminRecord?.returnHealthInsuranceCard ?? "-"}
          />
          <InfoRow
            label="セキュリティカード"
            value={adminRecord?.returnSecurityCard ?? "-"}
          />
        </div>
      </div>
    </div>
  </div>
);

const NotesSection = ({
  employee,
  contracts,
}: {
  employee: NonNullable<EmployeeDetailResponse["employee"]>;
  contracts: EmployeeDetailResponse["contracts"];
}) => (
  <div className="space-y-6">
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">特記事項</h4>
      <InfoRow label="更新メモ" value={contracts[0]?.hourlyWageNote ?? "-"} />
      <InfoRow label="最終更新者" value={employee.updatedAt ?? "-"} />
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">備考</h4>
      <p className="text-sm text-slate-600">契約ごとの連絡メモを記載予定です。</p>
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
      return "常勤";
    case "CONTRACT":
      return "契約社員";
    case "PART_TIME":
      return "パートタイム";
    default:
      return "パートタイム";
  }
};

const employmentStatusLabel = (value: string) => {
  switch (value) {
    case "ACTIVE":
      return "在職中";
    case "RETIRED":
      return "退職済み";
    case "ON_LEAVE":
      return "休職中";
    default:
      return value;
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
