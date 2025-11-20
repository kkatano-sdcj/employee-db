import Link from "next/link";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

import { ContractActionMenu } from "@/components/contracts/ContractActionMenu";
import { ContractAlertBadge } from "@/components/contracts/ContractAlertBadge";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { formatCurrency } from "@/lib/formatters";
import { fetchContractSummaries } from "@/server/queries/contracts";

const formatDate = (value?: string | null) => (value ? value.replaceAll("-", "/") : "-");

const formatContractType = (type: string) => (type === "INDEFINITE" ? "無期" : "有期");

const getInitials = (name: string) => name.substring(0, 2);

export default async function ContractsPage() {
  const contracts = await fetchContractSummaries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Contracts</p>
          <h1 className="text-2xl font-semibold text-slate-900">契約管理</h1>
          <p className="text-sm text-slate-500">
            契約番号・雇用期間・更新ステータスを一目で把握します。
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft"
        >
          <DocumentArrowDownIcon className="h-5 w-5" /> CSV/給与データ抽出
        </Link>
      </div>

      <div className="section-card overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="全契約を選択"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
              </th>
              <th className="px-3 py-3">契約番号</th>
              <th className="px-3 py-3">従業員</th>
              <th className="px-3 py-3">契約タイプ</th>
              <th className="px-3 py-3">開始日</th>
              <th className="px-3 py-3">終了予定日</th>
              <th className="px-3 py-3">時給</th>
              <th className="px-3 py-3">状態</th>
              <th className="px-3 py-3">アラート</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label={`${contract.name}を選択`}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    {contract.contractNumber}
                  </div>
                  <div className="text-xs text-slate-400">#{contract.employeeNumber}</div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-600">
                      {getInitials(contract.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{contract.name}</div>
                      <div className="text-xs text-slate-500">{contract.departmentCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm">{formatContractType(contract.contractType)}</td>
                <td className="px-3 py-4 font-mono text-sm">{formatDate(contract.contractStartDate)}</td>
                <td className="px-3 py-4">
                  <div className="font-mono text-sm text-slate-700">
                    {contract.employmentExpiryScheduledDate
                      ? formatDate(contract.employmentExpiryScheduledDate)
                      : "継続"}
                  </div>
                  {contract.employmentExpiryDate && (
                    <div className="text-xs text-slate-400">
                      実満了: {formatDate(contract.employmentExpiryDate)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-4 text-sm">{formatCurrency(contract.hourlyWage)}</td>
                <td className="px-3 py-4">
                  <ContractStatusBadge status={contract.status} />
                </td>
                <td className="px-3 py-4">
                  <ContractAlertBadge
                    needsUpdate={contract.needsUpdate}
                    scheduledDate={contract.employmentExpiryScheduledDate}
                    actualDate={contract.employmentExpiryDate}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  <ContractActionMenu
                    contractId={contract.contractNumber}
                    employeeId={contract.employeeId}
                    employeeName={contract.name}
                    employeeNumber={contract.employeeNumber}
                  />
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-sm text-slate-500">
                  契約データはありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
