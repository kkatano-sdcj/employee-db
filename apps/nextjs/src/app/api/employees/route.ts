import { NextResponse } from "next/server";

import { createEmployee } from "@/server/actions/create-employee";
import type { EmployeeFormValues } from "@/lib/schemas/employee";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmployeeFormValues;
    const result = await createEmployee(payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("failed to create employee", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "従業員の登録に失敗しました",
      },
      { status: 400 },
    );
  }
}
