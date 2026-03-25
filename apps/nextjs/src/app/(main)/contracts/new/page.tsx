import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { EmployeeForm } from "@/components/employees/EmployeeForm";
import {
  defaultEmployeeFormValues,
  type EmployeeFormValues,
} from "@/lib/schemas/employee";
import { fetchEmployeeDetail } from "@/server/queries/employees";

type ContractNewPageProps = {
  searchParams: Promise<{ employeeId?: string }>;
};

export default async function ContractNewPage({ searchParams }: ContractNewPageProps) {
  const params = await searchParams;
  const employeeId = params.employeeId;

  if (!employeeId) {
    // 従業員IDが指定されていない場合は契約一覧にリダイレクト
    redirect("/contracts");
  }

  const detail = await fetchEmployeeDetail(employeeId);

  if (!detail.employee) {
    notFound();
  }

  // 基本情報は既存の従業員データから取得し、契約関連の入力欄は全て空白で開始
  const initialValues: EmployeeFormValues = {
    // 従業員基本情報（既存データから取得）
    contractNumber: "",
    employeeNumber: detail.employee.employeeNumber,
    name: detail.employee.name,
    nameKana: detail.employee.nameKana || "",
    stickerItem: detail.employee.stickerItem || "",
    gender: (detail.employee.gender as EmployeeFormValues["gender"]) ?? defaultEmployeeFormValues.gender,
    birthDate: detail.employee.birthDate || "",
    nationality: detail.employee.nationality || "",
    hiredAt: detail.employee.hiredAt || "",
    rehiredAt: "",
    retiredAt: "",
    employmentType:
      (detail.employee.employmentType as EmployeeFormValues["employmentType"]) ??
      defaultEmployeeFormValues.employmentType,
    employmentStatus:
      (detail.employee.employmentStatus as EmployeeFormValues["employmentStatus"]) ??
      defaultEmployeeFormValues.employmentStatus,
    departmentCode: detail.employee.departmentCode,
    siteCode: detail.employee.siteCode || "",
    myNumber: "",
    rehireCount: detail.employee.rehireCount ?? 0,
    originalHireDate: detail.employee.originalHireDate || "",
    currentHireDate: detail.employee.currentHireDate || "",
    // 連絡先情報（空白）
    contact: {
      postalCode: "",
      address1: "",
      address2: "",
      address1Kana: "",
      address2Kana: "",
      phone1: "",
      email1: "",
      residentAddressSame: true,
      residentPostalCode: "",
      residentAddress1: "",
      residentAddress2: "",
      residentAddress1Kana: "",
      residentAddress2Kana: "",
    },
    // 社会保険・給与関連（空白）
    adminRecords: {
      healthInsuranceCategory: "",
      pensionCategory: "",
      basicPensionNumber: "",
      pensionFundCategory: "",
      employmentInsurance: "",
      commutingExpenseCategory: "",
      baseSalary: undefined,
      commutingExpensePaymentMethod: "",
      dailyPaymentAmount: undefined,
    },
    // 勤務条件（空白）
    workDaysType: "WEEKLY",
    workDaysCount: 0,
    workDaysCountNote: "",
    paidLeaveBaseDate: "",
    workingHours: [{ start: "", end: "" }],
    breakHours: [],
    workLocations: [
      {
        companyName: "",
        officeName: "",
        address: "",
        phoneNumber: "",
        location: "",
      },
    ],
    transportationRoutes: [
      {
        route: "",
        usagePeriod: "",
        transportationName: "",
        roundTripAmount: 0,
        monthlyPassAmount: undefined,
        maxAmount: undefined,
        nearestStation: "",
      },
    ],
    // 書類・提出状況（空白）
    documents: {
      healthInsuranceCardSubmitted: "",
      submittedToAdminOn: "",
      returnedToEmployee: "",
      expirationNoticeIssued: "",
      resignationLetterSubmitted: "",
      returnHealthInsuranceCard: "",
      returnSecurityCard: "",
    },
    // 契約情報（空白）
    contract: {
      contractType: "FIXED_TERM",
      contractStartDate: "",
      contractEndDate: "",
      isRenewable: false,
      hourlyWage: 0,
      hourlyWageNote: "",
      overtimeHourlyWage: undefined,
      subLeaderAllowanceAmount: undefined,
      perfectAttendanceAllowanceEligible: false,
      jobDescription: "",
      paidLeaveClause: "",
      approvalNumber: "",
      specialNote: "",
      jobDescriptionChangeScope: "会社の定める業務",
      workLocationChangeScope: "会社の定める事業所",
      overtimeWork: true,
      holidayWork: true,
      paidLeaveDays: undefined,
      paidLeaveBaseDateType: "",
      paidLeaveBaseDate: "",
      disabilityLeaveFrequency: "",
      commutingAllowanceMax: 15000,
      retirementAge: undefined,
      retirementDate: "",
      clientHolidayFollow: false,
      holidaysNote: "",
      workingHoursNote: "",
      pieceworkShiftPattern: "",
      bonusClause: "支給する。額については、個人の業務内容、業務の責任の範囲、会社・組織の業績などに基づき、個人ごとに個別に決定する。",
      employmentInsuranceEnrolled: false,
      healthInsuranceEnrolled: false,
      pensionEnrolled: false,
      pensionFundEnrolled: false,
      eligibilityCertRequired: false,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">New Contract</p>
          <h1 className="text-2xl font-semibold text-slate-900">新規契約作成</h1>
          <p className="text-sm text-slate-500">
            {detail.employee.name}（社員コード: {detail.employee.employeeNumber}）
          </p>
        </div>
        <Link
          href="/contracts"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          契約一覧へ戻る
        </Link>
      </div>

      {/* 従業員基本情報（固定表示） */}
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">従業員基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">社員コード:</span>{" "}
            <span className="font-medium text-slate-900">{detail.employee.employeeNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">氏名:</span>{" "}
            <span className="font-medium text-slate-900">{detail.employee.name}</span>
          </div>
          <div>
            <span className="text-slate-500">氏名（カナ）:</span>{" "}
            <span className="font-medium text-slate-900">{detail.employee.nameKana || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500">部門:</span>{" "}
            <span className="font-medium text-slate-900">{detail.employee.departmentCode}</span>
          </div>
          <div>
            <span className="text-slate-500">入社日:</span>{" "}
            <span className="font-medium text-slate-900">{detail.employee.hiredAt || "-"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <EmployeeForm
          mode="create"
          context="contract-management"
          employeeId={detail.employee.id}
          initialValues={initialValues}
          redirectTo="/contracts"
        />
      </div>
    </div>
  );
}

