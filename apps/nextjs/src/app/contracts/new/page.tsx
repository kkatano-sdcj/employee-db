import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { defaultEmployeeFormValues } from "@/lib/schemas/employee";
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

  // 基本情報は既存の従業員データから取得し、契約情報は空で開始
  const initialValues = {
    ...defaultEmployeeFormValues,
    // 従業員基本情報
    employeeNumber: detail.employee.employeeNumber,
    name: detail.employee.name,
    nameKana: detail.employee.nameKana || "",
    gender: detail.employee.gender,
    birthDate: detail.employee.birthDate || "",
    nationality: detail.employee.nationality || "",
    hiredAt: detail.employee.hiredAt || "",
    retiredAt: detail.employee.retiredAt || "",
    employmentType: detail.employee.employmentType,
    employmentStatus: detail.employee.employmentStatus,
    departmentCode: detail.employee.departmentCode,
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

