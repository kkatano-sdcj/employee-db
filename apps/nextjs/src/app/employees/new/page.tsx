import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default function EmployeeRegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Register</p>
        <h1 className="text-2xl font-semibold text-slate-900">従業員登録</h1>
        <p className="text-sm text-slate-500">
          従業員の基本情報を登録します。勤務条件と契約情報は契約管理ページから登録してください。
        </p>
      </div>
      <EmployeeForm context="employee-management" />
    </div>
  );
}
