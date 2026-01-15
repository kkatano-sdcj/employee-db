"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteUserAction } from "@/server/actions/users";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  currentUserId: string;
}

export function DeleteUserButton({
  userId,
  userName,
  currentUserId,
}: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自分自身は削除できない
  const isSelf = userId === currentUserId;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        setError(result.error || "削除に失敗しました");
      }
      setShowConfirm(false);
    });
  };

  if (isSelf) {
    return (
      <span className="text-xs text-slate-400">自分自身</span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title="ユーザーを削除"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              ユーザーを削除しますか？
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-medium">{userName}</span> を削除します。この操作は取り消せません。
            </p>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setError(null);
                }}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


