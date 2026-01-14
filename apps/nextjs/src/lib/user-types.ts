// ユーザーロール関連の型と定数（クライアント/サーバー共通で使用）

export type UserRole =
  | "SYSTEM_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "FIELD_MANAGER"
  | "GENERAL_AFFAIRS"
  | "AUDITOR";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentCode: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const roleLabels: Record<UserRole, string> = {
  SYSTEM_ADMIN: "システム管理者",
  ADMIN: "管理者",
  HR_MANAGER: "統括人事管理者",
  FIELD_MANAGER: "現場マネージャー",
  GENERAL_AFFAIRS: "総務",
  AUDITOR: "監査人",
};

export const roleColors: Record<UserRole, string> = {
  SYSTEM_ADMIN: "bg-red-100 text-red-800",
  ADMIN: "bg-purple-100 text-purple-800",
  HR_MANAGER: "bg-blue-100 text-blue-800",
  FIELD_MANAGER: "bg-green-100 text-green-800",
  GENERAL_AFFAIRS: "bg-yellow-100 text-yellow-800",
  AUDITOR: "bg-gray-100 text-gray-800",
};
