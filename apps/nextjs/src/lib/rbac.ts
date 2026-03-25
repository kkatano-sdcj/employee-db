import { headers } from "next/headers";
import { auth, type UserRole } from "@/lib/auth";

/**
 * RBAC権限制御ユーティリティ（Phase 10）
 *
 * ロール階層（上位が下位の権限を含む）:
 * SYSTEM_ADMIN > ADMIN > HR_MANAGER > FIELD_MANAGER > GENERAL_AFFAIRS > AUDITOR
 */

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SYSTEM_ADMIN: 60,
  ADMIN: 50,
  HR_MANAGER: 40,
  FIELD_MANAGER: 30,
  GENERAL_AFFAIRS: 20,
  AUDITOR: 10,
};

export type CurrentUser = {
  id: string;
  role: UserRole;
  departmentCode?: string | null;
  email: string;
  name: string;
};

/**
 * 現在のセッションからユーザー情報を取得
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    return {
      id: session.user.id,
      role: (session.user as Record<string, unknown>).role as UserRole ?? "FIELD_MANAGER",
      departmentCode: (session.user as Record<string, unknown>).departmentCode as string | null ?? null,
      email: session.user.email,
      name: session.user.name,
    };
  } catch {
    return null;
  }
}

/**
 * ロールが指定レベル以上かどうかチェック
 */
export function hasRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * 個人番号（myNumber）へのアクセス権限チェック
 * HR_MANAGER以上のみアクセス可能
 */
export function canAccessMyNumber(role: UserRole): boolean {
  return hasRoleAtLeast(role, "HR_MANAGER");
}

/**
 * 時給単価（hourlyWage）へのアクセス権限チェック
 * FIELD_MANAGER以上のみアクセス可能
 */
export function canAccessHourlyWage(role: UserRole): boolean {
  return hasRoleAtLeast(role, "FIELD_MANAGER");
}

/**
 * 従業員データの行レベルフィルタリング
 * FIELD_MANAGERは自部門のみ閲覧可能
 */
export function getDepartmentFilter(user: CurrentUser): string | null {
  if (hasRoleAtLeast(user.role, "HR_MANAGER")) {
    // HR_MANAGER以上は全部門閲覧可能
    return null;
  }
  // FIELD_MANAGER以下は自部門のみ
  return user.departmentCode ?? null;
}

/**
 * フィールドの値をロールに基づいてマスクする
 */
export function maskField<T>(
  value: T,
  hasAccess: boolean,
  maskedValue: T,
): T {
  return hasAccess ? value : maskedValue;
}
