import { db } from "@/server/db";

export type PayrollRow = {
  employeeNumber: string;
  name: string;
  departmentCode: string;
  employmentType: string;
  contractStartDate?: string;
  contractEndDate?: string | null;
  hourlyWage?: number | null;
  workDaysType?: string | null;
  workDaysCount?: number | null;
  workingHoursTotal?: number;
  route?: string | null;
  monthlyPassAmount?: number | null;
  roundTripAmount?: number | null;
};

export async function fetchPayrollSnapshot(targetDate?: string): Promise<PayrollRow[]> {
  const snapshotDate = targetDate ? new Date(targetDate) : new Date();
  const snapshotIso = snapshotDate.toISOString().slice(0, 10);

  const rows = await db<
    Array<{
      employeeNumber: string;
      name: string;
      departmentCode: string;
      employmentType: string;
      contractStartDate: Date | string | null;
      contractEndDate: Date | string | null;
      hourlyWage: number | null;
      workDaysType: string | null;
      workDaysCount: number | null;
      workingHoursTotal: number | null;
      route: string | null;
      monthlyPassAmount: number | null;
      roundTripAmount: number | null;
    }>
  >`
    SELECT
      e.employee_number as "employeeNumber",
      e.name,
      e.department_code as "departmentCode",
      e.employment_type as "employmentType",
      c.contract_start_date as "contractStartDate",
      c.contract_end_date as "contractEndDate",
      c.hourly_wage as "hourlyWage",
      wc.work_days_type as "workDaysType",
      wc.work_days_count as "workDaysCount",
      (
        SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (wh.end_time - wh.start_time))), 0) / 3600
        FROM working_hours wh
        WHERE wh.work_condition_id = wc.id
      ) as "workingHoursTotal",
      tr.route,
      tr.monthly_pass_amount as "monthlyPassAmount",
      tr.round_trip_amount as "roundTripAmount"
    FROM employees e
    LEFT JOIN LATERAL (
      SELECT *
      FROM contracts c2
      WHERE c2.employee_id = e.id
        AND (c2.contract_start_date IS NULL OR c2.contract_start_date <= ${snapshotIso})
        AND (c2.contract_end_date IS NULL OR c2.contract_end_date >= ${snapshotIso})
      ORDER BY c2.contract_start_date DESC
      LIMIT 1
    ) c ON TRUE
    LEFT JOIN LATERAL (
      SELECT *
      FROM work_conditions wc2
      WHERE wc2.employee_id = e.id
        AND (wc2.effective_from IS NULL OR wc2.effective_from <= ${snapshotIso})
        AND (wc2.effective_to IS NULL OR wc2.effective_to >= ${snapshotIso})
      ORDER BY wc2.effective_from DESC
      LIMIT 1
    ) wc ON TRUE
    LEFT JOIN LATERAL (
      SELECT *
      FROM transportation_routes tr2
      WHERE tr2.work_condition_id = wc.id
      ORDER BY tr2.round_trip_amount DESC NULLS LAST
      LIMIT 1
    ) tr ON TRUE
    WHERE e.employment_status != 'RETIRED'
    ORDER BY e.employee_number
  `;

  return rows.map((row) => ({
    ...row,
    contractStartDate: row.contractStartDate
      ? new Date(row.contractStartDate).toISOString().slice(0, 10)
      : undefined,
    contractEndDate: row.contractEndDate
      ? new Date(row.contractEndDate).toISOString().slice(0, 10)
      : undefined,
    hourlyWage: row.hourlyWage ? Number(row.hourlyWage) : null,
    workDaysCount: row.workDaysCount ? Number(row.workDaysCount) : null,
    workingHoursTotal: row.workingHoursTotal ? Number(row.workingHoursTotal) : 0,
    monthlyPassAmount: row.monthlyPassAmount ? Number(row.monthlyPassAmount) : null,
    roundTripAmount: row.roundTripAmount ? Number(row.roundTripAmount) : null,
  }));
}
