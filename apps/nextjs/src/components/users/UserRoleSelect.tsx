"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAction } from "@/server/actions/users";
import { roleLabels, roleColors, type UserRole } from "@/lib/user-types";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  currentDepartmentCode: string | null;
  currentUserRole: UserRole;
}

const allRoles: UserRole[] = [
  "SYSTEM_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FIELD_MANAGER",
  "GENERAL_AFFAIRS",
  "AUDITOR",
];

export function UserRoleSelect({
  userId,
  currentRole,
  currentDepartmentCode,
  currentUserRole,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [departmentCode, setDepartmentCode] = useState(currentDepartmentCode || "");
  const [showDepartmentInput, setShowDepartmentInput] = useState(currentRole === "FIELD_MANAGER");
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setShowDepartmentInput(newRole === "FIELD_MANAGER");
    setError(null);

    // FIELD_MANAGER以外の場合は即座に更新
    if (newRole !== "FIELD_MANAGER") {
      startTransition(async () => {
        const result = await updateUserRoleAction(userId, newRole, null);
        if (!result.success) {
          setError(result.error || "更新に失敗しました");
          setRole(currentRole);
        }
      });
    }
  };

  const handleDepartmentCodeSave = () => {
    if (role === "FIELD_MANAGER" && !departmentCode.trim()) {
      setError("FIELD_MANAGERには部門コードが必要です");
      return;
    }

    startTransition(async () => {
      const result = await updateUserRoleAction(
        userId,
        role,
        role === "FIELD_MANAGER" ? departmentCode.trim() : null
      );
      if (!result.success) {
        setError(result.error || "更新に失敗しました");
      } else {
        setError(null);
      }
    });
  };

  // SYSTEM_ADMINのロールは変更できない（自分自身でない限り）
  const canChangeRole = currentUserRole === "SYSTEM_ADMIN" || currentRole !== "SYSTEM_ADMIN";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          disabled={isPending || !canChangeRole}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
            ${roleColors[role]}
            ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}
            ${!canChangeRole ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
        {isPending && (
          <span className="text-xs text-slate-400">更新中...</span>
        )}
      </div>

      {showDepartmentInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
            placeholder="部門コード"
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg w-24"
          />
          <button
            onClick={handleDepartmentCodeSave}
            disabled={isPending}
            className="px-2 py-1 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}


