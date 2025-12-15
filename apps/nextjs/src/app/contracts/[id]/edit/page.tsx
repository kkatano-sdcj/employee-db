import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { mapEmployeeDetailToFormValues } from "@/lib/mappers/employee-form";
import { fetchEmployeeDetail } from "@/server/queries/employees";
import { fetchContractSummaries } from "@/server/queries/contracts";

type ContractEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContractEditPage({ params }: ContractEditPageProps) {
  const { id: contractId } = await params;

  // 契約IDから従業員IDを取得
  const contracts = await fetchContractSummaries();
  const contract = contracts.find((c) => c.id === contractId);

  if (!contract) {
    notFound();
  }

  const detail = await fetchEmployeeDetail(contract.employeeId);

  if (!detail.employee) {
    notFound();
  }

  const { values, workConditionId } = mapEmployeeDetailToFormValues(detail);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Edit Contract</p>
          <h1 className="text-2xl font-semibold text-slate-900">契約更新</h1>
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
          mode="edit"
          context="contract-management"
          employeeId={detail.employee.id}
          initialValues={values}
          workConditionId={workConditionId}
          contractId={contractId}
          redirectTo="/contracts"
        />
      </div>
    </div>
  );
}

