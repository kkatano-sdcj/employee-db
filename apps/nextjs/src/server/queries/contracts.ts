import { db } from "@/server/db";
import { fetchEmployeeDetail, type EmployeeDetail } from "@/server/queries/employees";

export type ContractHistorySnapshot = {
  effectiveDate?: string;
  workCondition?: Record<string, unknown>;
  contractTerms?: Record<string, unknown>;
  documents?: Record<string, unknown>;
};

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
  latestHistory?: ContractHistorySnapshot;
};

type EmploymentHistoryCapability = {
  hasContractId: boolean;
  hasSnapshots: boolean;
};

let employmentHistoryCapabilityPromise: Promise<EmploymentHistoryCapability> | null = null;

const getEmploymentHistoryCapability = async (): Promise<EmploymentHistoryCapability> => {
  if (!employmentHistoryCapabilityPromise) {
    employmentHistoryCapabilityPromise = (async () => {
      try {
        const rows = await db<
          Array<{ hasContract: number | null; hasSnapshots: number | null }>
        >`
          SELECT
            MAX(CASE WHEN column_name = 'contract_id' THEN 1 ELSE 0 END) as "hasContract",
            MAX(CASE WHEN column_name = 'work_condition_snapshot' THEN 1 ELSE 0 END) as "hasSnapshots"
          FROM information_schema.columns
          WHERE table_name = 'employment_history'
        `;
        const row = rows[0];
        return {
          hasContractId: Boolean(row?.hasContract),
          hasSnapshots: Boolean(row?.hasSnapshots),
        };
      } catch (error) {
        return { hasContractId: false, hasSnapshots: false };
      }
    })();
  }
  return employmentHistoryCapabilityPromise;
};

export async function fetchContractSummaries(): Promise<ContractSummary[]> {
  const capability = await getEmploymentHistoryCapability();

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
      historyEffectiveDate: Date | string | null;
      historyRaw: Record<string, unknown> | null;
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
      END as "needsUpdate",
      ${capability.hasSnapshots && capability.hasContractId ? db`history.effective_date` : db`NULL`} as "historyEffectiveDate",
      ${capability.hasSnapshots && capability.hasContractId ? db`history.snapshot` : db`NULL`} as "historyRaw"
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    ${
      capability.hasSnapshots && capability.hasContractId
        ? db`
            LEFT JOIN LATERAL (
              SELECT
                eh.effective_date,
                to_jsonb(eh) as snapshot
              FROM employment_history eh
              WHERE eh.contract_id = c.id
              ORDER BY eh.effective_date DESC, eh.created_at DESC
              LIMIT 1
            ) history ON TRUE
          `
        : db``
    }
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
    latestHistory:
      row.historyEffectiveDate || row.historyRaw
        ? {
            effectiveDate: row.historyEffectiveDate
              ? new Date(row.historyEffectiveDate).toISOString().slice(0, 10)
              : undefined,
            workCondition: (row.historyRaw?.["work_condition_snapshot"] as Record<string, unknown>) ?? undefined,
            contractTerms: (row.historyRaw?.["contract_terms_snapshot"] as Record<string, unknown>) ?? undefined,
            documents: (row.historyRaw?.["documents_snapshot"] as Record<string, unknown>) ?? undefined,
          }
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
