"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { deleteContract } from "@/server/actions/contracts";

type DeleteContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  employeeName: string;
  employeeNumber: string;
};

export function DeleteContractModal({
  isOpen,
  onClose,
  contractId,
  employeeName,
  employeeNumber,
}: DeleteContractModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText === "削除する";

  const handleDelete = () => {
    if (!isConfirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteContract(contractId);
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error ?? "削除に失敗しました");
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setConfirmText("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Warning icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-lg font-bold text-slate-900">
          契約を削除しますか？
        </h2>

        {/* Description */}
        <p className="mb-4 text-center text-sm text-slate-600">
          以下の契約を削除します。この操作は取り消せません。
        </p>

        {/* Contract info */}
        <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="mb-1 text-slate-500">対象契約</div>
          <div className="font-semibold text-slate-900">
            {employeeName}（{employeeNumber}）
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500">
            契約番号: {contractId}
          </div>
        </div>

        {/* Warning message */}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <strong>注意:</strong> 契約を削除すると、関連する雇用履歴データも全て削除されます。
        </div>

        {/* Confirmation input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            確認のため「削除する」と入力してください
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="削除する"
            disabled={isPending}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none disabled:bg-slate-100 disabled:opacity-50"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}
