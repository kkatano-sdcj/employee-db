import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { mapEmployeeDetailToFormValues } from "@/lib/mappers/employee-form";
import { fetchEmployeeDetail } from "@/server/queries/employees";

type EmployeeEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ source?: string }>;
};

export default async function EmployeeEditPage({ params, searchParams }: EmployeeEditPageProps) {
  const searchParamsPromise: Promise<{ source?: string }> =
    searchParams ?? Promise.resolve<{ source?: string }>({});
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParamsPromise]);
  const detail = await fetchEmployeeDetail(id);

  if (!detail.employee) {
    notFound();
  }

  const source = resolvedSearchParams?.source === "contract" ? "contract" : "employee";
  const { values, workConditionId, contractId } = mapEmployeeDetailToFormValues(detail);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Edit</p>
          <h1 className="text-2xl font-semibold text-slate-900">従業員情報を編集</h1>
          <p className="text-sm text-slate-500">
            {detail.employee.name}（従業員番号: {detail.employee.employeeNumber}）
          </p>
        </div>
        <Link
          href={`/employees/${detail.employee.id}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          詳細へ戻る
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <EmployeeForm
          mode="edit"
          context={source === "contract" ? "contract-management" : "employee-management"}
          employeeId={detail.employee.id}
          initialValues={values}
          workConditionId={workConditionId}
          contractId={contractId}
          redirectTo={`/employees/${detail.employee.id}`}
        />
      </div>
    </div>
  );
}
