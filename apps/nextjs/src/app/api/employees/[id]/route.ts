import { NextResponse } from "next/server";

import { updateEmployee } from "@/server/actions/update-employee";
import type { EmployeeFormValues } from "@/lib/schemas/employee";

type UpdateRequestPayload = {
  values?: EmployeeFormValues;
  workConditionId?: string | null;
  contractId?: string | null;
};

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as UpdateRequestPayload;

    if (!payload?.values) {
      return NextResponse.json(
        { ok: false, message: "更新内容が不足しています" },
        { status: 400 },
      );
    }

    const result = await updateEmployee({
      employeeId: id,
      workConditionId: payload.workConditionId,
      contractId: payload.contractId,
      values: payload.values,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("failed to update employee", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "従業員の更新に失敗しました",
      },
      { status: 400 },
    );
  }
}
