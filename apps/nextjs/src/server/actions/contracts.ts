"use server";

import { db } from "@/server/db";

/**
 * 契約番号を自動生成する（FR-097）
 * フォーマット: {employee_number}-CON{5桁の連番}
 * 例: BPS0001-CON00001
 */
export async function generateContractNumber(employeeNumber: string): Promise<string> {
  const prefix = `${employeeNumber}-CON`;

  const rows = await db<Array<{ id: string }>>`
    SELECT id FROM contracts
    WHERE id LIKE ${prefix + "%"}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return `${prefix}00001`;
  }

  const lastId = rows[0]!.id;
  const numPart = lastId.substring(prefix.length);
  const nextNum = parseInt(numPart, 10) + 1;

  return `${prefix}${String(nextNum).padStart(5, "0")}`;
}

type DeleteContractResult = {
  success: boolean;
  error?: string;
};

export async function deleteContract(contractId: string): Promise<DeleteContractResult> {
  try {
    // 契約が存在するか確認
    const existingContract = await db<Array<{ id: string; employeeId: string }>>`
      SELECT id, employee_id as "employeeId"
      FROM contracts
      WHERE id = ${contractId}
      LIMIT 1
    `;

    if (existingContract.length === 0) {
      return { success: false, error: "契約が見つかりません" };
    }

    // 契約を削除（employment_history は ON DELETE CASCADE で自動削除）
    await db`
      DELETE FROM contracts
      WHERE id = ${contractId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to delete contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "契約の削除に失敗しました",
    };
  }
}
