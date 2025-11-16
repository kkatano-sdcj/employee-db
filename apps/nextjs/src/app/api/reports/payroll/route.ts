import { NextResponse } from "next/server";
import Papa from "papaparse";

import { fetchPayrollSnapshot } from "@/server/queries/reports";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const rows = await fetchPayrollSnapshot(date ?? undefined);

  const csv = Papa.unparse(
    rows.map((row) => ({
      employeeNumber: row.employeeNumber,
      name: row.name,
      departmentCode: row.departmentCode,
      employmentType: row.employmentType,
      contractStartDate: row.contractStartDate ?? "",
      contractEndDate: row.contractEndDate ?? "",
      hourlyWage: row.hourlyWage ?? "",
      workDaysType: row.workDaysType ?? "",
      workDaysCount: row.workDaysCount ?? "",
      workingHoursTotal: row.workingHoursTotal ?? "",
      route: row.route ?? "",
      monthlyPassAmount: row.monthlyPassAmount ?? "",
      roundTripAmount: row.roundTripAmount ?? "",
    })),
  );

  return new NextResponse(`\ufeff${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payroll-${date ?? "current"}.csv"`,
    },
  });
}
