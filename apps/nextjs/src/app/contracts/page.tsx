import Link from "next/link";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

import { formatCurrency } from "@/lib/formatters";
import { fetchContractSummaries } from "@/server/queries/contracts";

export default async function ContractsPage() {
  const contracts = await fetchContractSummaries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Contracts</p>
          <h1 className="text-2xl font-semibold text-slate-900">契約管理</h1>
          <p className="text-sm text-slate-500">契約期間、枝番、更新状況を迅速に確認</p>
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
            <tr className="text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">従業員</th>
              <th className="px-4 py-3">契約タイプ</th>
              <th className="px-4 py-3">期間</th>
              <th className="px-4 py-3">時給</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">アラート</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">{contract.name}</div>
                  <div className="text-xs text-slate-400">#{contract.employeeNumber}</div>
                </td>
                <td className="px-4 py-4 text-sm">
                  {contract.contractType === "INDEFINITE" ? "無期" : "有期"}
                </td>
                <td className="px-4 py-4 text-sm">
                  {contract.contractStartDate ?? "-"} ~{" "}
                  {contract.employmentExpiryScheduledDate ?? "継続"}
                  {contract.employmentExpiryDate && (
                    <span className="ml-2 text-xs text-slate-400">
                      （実満了: {contract.employmentExpiryDate}）
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm">
                  {formatCurrency(contract.hourlyWage)}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {contractStatusLabel(contract.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  {contract.needsUpdate ? (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
                        要更新
                      </span>
                      {contract.employmentExpiryScheduledDate && (
                        <span className="block text-xs text-rose-500">
                          満了予定日: {contract.employmentExpiryScheduledDate}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
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

const contractStatusLabel = (value: string) => {
  switch (value) {
    case "AWAITING_APPROVAL":
      return "承認待ち";
    case "SUBMITTED":
      return "提出済";
    case "RETURNED":
      return "差戻し";
    default:
      return "下書き";
  }
};
