"use server";

import { revalidatePath } from "next/cache";
import { updateUserRole as updateUserRoleQuery, deleteUser as deleteUserQuery, type UserRole } from "@/server/queries/users";

export async function updateUserRoleAction(
  id: string,
  role: UserRole,
  departmentCode?: string | null
) {
  try {
    const user = await updateUserRoleQuery(id, role, departmentCode);
    if (!user) {
      return { success: false, error: "ユーザーが見つかりません" };
    }
    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "ロールの更新に失敗しました" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const success = await deleteUserQuery(id);
    if (!success) {
      return { success: false, error: "ユーザーが見つかりません" };
    }
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "ユーザーの削除に失敗しました" };
  }
}


