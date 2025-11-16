import { db } from "@/server/db";

export type ContractSummary = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  name: string;
  departmentCode: string;
  contractType: string;
  contractStartDate?: string;
  contractEndDate?: string | null;
  status: string;
  hourlyWage: number;
  terminationAlertFlag: boolean;
};

export async function fetchContractSummaries(): Promise<ContractSummary[]> {
  const rows = await db<
    Array<{
      id: string;
      employeeId: string;
      employeeNumber: string;
      name: string;
      departmentCode: string;
      contractType: string;
      contractStartDate: Date | string | null;
      contractEndDate: Date | string | null;
      status: string;
      hourlyWage: number;
      terminationAlertFlag: boolean;
    }>
  >`
    SELECT
      c.id,
      c.employee_id as "employeeId",
      e.employee_number as "employeeNumber",
      e.name,
      e.department_code as "departmentCode",
      c.contract_type as "contractType",
      c.contract_start_date as "contractStartDate",
      c.contract_end_date as "contractEndDate",
      c.status,
      c.hourly_wage as "hourlyWage",
      c.termination_alert_flag as "terminationAlertFlag"
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    ORDER BY c.contract_start_date DESC
  `;

  return rows.map((row) => ({
    ...row,
    hourlyWage: Number(row.hourlyWage ?? 0),
    contractStartDate: row.contractStartDate
      ? new Date(row.contractStartDate).toISOString().slice(0, 10)
      : undefined,
    contractEndDate: row.contractEndDate
      ? new Date(row.contractEndDate).toISOString().slice(0, 10)
      : undefined,
  }));
}
