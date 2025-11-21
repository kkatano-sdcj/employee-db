import { db } from "@/server/db";
import { fetchEmployeeDetail, type EmployeeDetail } from "@/server/queries/employees";

export type ContractSummary = {
  id: string;
  contractNumber: string;
  employeeId: string;
  employeeNumber: string;
  name: string;
  departmentCode: string;
  contractType: string;
  contractStartDate?: string;
  employmentExpiryScheduledDate?: string | null;
  employmentExpiryDate?: string | null;
  status: string;
  hourlyWage: number;
  needsUpdate: boolean;
};

export async function fetchContractSummaries(): Promise<ContractSummary[]> {
  const rows = await db<
    Array<{
      id: string;
      contractNumber: string;
      employeeId: string;
      employeeNumber: string;
      name: string;
      departmentCode: string;
      contractType: string;
      contractStartDate: Date | string | null;
      employmentExpiryScheduledDate: Date | string | null;
      employmentExpiryDate: Date | string | null;
      status: string;
      hourlyWage: number;
      needsUpdate: boolean;
    }>
  >`
    SELECT
      c.id,
      c.id as "contractNumber",
      c.employee_id as "employeeId",
      e.employee_number as "employeeNumber",
      e.name,
      e.department_code as "departmentCode",
      c.contract_type as "contractType",
      c.contract_start_date as "contractStartDate",
      c.employment_expiry_scheduled_date as "employmentExpiryScheduledDate",
      c.employment_expiry_date as "employmentExpiryDate",
      c.status,
      c.hourly_wage as "hourlyWage",
      CASE
        WHEN c.employment_expiry_scheduled_date IS NULL THEN false
        WHEN c.employment_expiry_scheduled_date < CURRENT_DATE THEN true
        ELSE false
      END as "needsUpdate"
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    ORDER BY c.contract_start_date DESC
  `;

  return rows.map((row) => ({
    ...row,
    contractNumber: row.contractNumber ?? row.id,
    hourlyWage: Number(row.hourlyWage ?? 0),
    contractStartDate: row.contractStartDate
      ? new Date(row.contractStartDate).toISOString().slice(0, 10)
      : undefined,
    employmentExpiryScheduledDate: row.employmentExpiryScheduledDate
      ? new Date(row.employmentExpiryScheduledDate).toISOString().slice(0, 10)
      : undefined,
    employmentExpiryDate: row.employmentExpiryDate
      ? new Date(row.employmentExpiryDate).toISOString().slice(0, 10)
      : undefined,
  }));
}

export type ContractDocumentData = {
  employee: NonNullable<EmployeeDetail["employee"]>;
  contract: EmployeeDetail["contracts"][number];
  primaryWorkCondition?: EmployeeDetail["workConditions"][number];
  adminRecord: EmployeeDetail["adminRecord"];
};

export async function fetchContractDocumentData(contractId: string): Promise<ContractDocumentData | null> {
  const rows = await db<Array<{ employeeId: string }>>`
    SELECT employee_id as "employeeId"
    FROM contracts
    WHERE id = ${contractId}
    LIMIT 1
  `;

  const record = rows[0];
  if (!record) {
    return null;
  }

  const detail = await fetchEmployeeDetail(record.employeeId);
  if (!detail.employee) {
    return null;
  }

  const targetContract = detail.contracts.find((contract) => contract.id === contractId) ?? detail.contracts[0];
  if (!targetContract) {
    return null;
  }

  return {
    employee: detail.employee,
    contract: targetContract,
    primaryWorkCondition: detail.workConditions[0],
    adminRecord: detail.adminRecord,
  };
}
