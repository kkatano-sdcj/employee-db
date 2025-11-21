import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";

import type { EmployeeFormValues } from "@/lib/schemas/employee";

export type EmploymentHistorySnapshots = {
  workCondition: Record<string, unknown>;
  contractTerms: Record<string, unknown>;
  documents: Record<string, unknown>;
};

export const buildEmploymentHistorySnapshots = (
  data: EmployeeFormValues,
): EmploymentHistorySnapshots => {
  const workConditionSnapshot = {
    workDaysType: data.workDaysType,
    workDaysCount: data.workDaysCount,
    workDaysCountNote: data.workDaysCountNote ?? null,
    paidLeaveBaseDate: data.paidLeaveBaseDate ?? null,
    workingHours: data.workingHours,
    breakHours: data.breakHours ?? [],
    workLocations: data.workLocations,
    transportationRoutes: data.transportationRoutes,
  } satisfies Record<string, unknown>;

  const contractSnapshot = {
    contractType: data.contract.contractType,
    contractStartDate: data.contract.contractStartDate,
    contractEndDate: data.contract.contractEndDate ?? null,
    isRenewable: data.contract.isRenewable,
    hourlyWage: data.contract.hourlyWage,
    hourlyWageNote: data.contract.hourlyWageNote ?? null,
    overtimeHourlyWage: data.contract.overtimeHourlyWage ?? null,
    jobDescription: data.contract.jobDescription ?? null,
    paidLeaveClause: data.contract.paidLeaveClause ?? null,
    approvalNumber: data.contract.approvalNumber ?? null,
  } satisfies Record<string, unknown>;

  const documentsSnapshot = {
    submittedToAdminOn: data.documents.submittedToAdminOn || null,
    returnedToEmployee: data.documents.returnedToEmployee || null,
    expirationNoticeIssued: data.documents.expirationNoticeIssued || null,
    resignationLetterSubmitted: data.documents.resignationLetterSubmitted || null,
    returnHealthInsuranceCard: data.documents.returnHealthInsuranceCard || null,
    returnSecurityCard: data.documents.returnSecurityCard || null,
  } satisfies Record<string, unknown>;

  return {
    workCondition: workConditionSnapshot,
    contractTerms: contractSnapshot,
    documents: documentsSnapshot,
  };
};

export async function insertEmploymentHistoryFromForm(
  trx: Sql,
  params: {
    employeeId: string;
    contractId: string;
    departmentCode: string;
    effectiveDate: string;
    eventType: string;
    remarks: string;
    form: EmployeeFormValues;
  },
) {
  const snapshots = buildEmploymentHistorySnapshots(params.form);
  const historyId = randomUUID();

  await trx`
    INSERT INTO employment_history (
      id,
      employee_id,
      contract_id,
      effective_date,
      event_type,
      department_code,
      hourly_wage,
      work_condition_snapshot,
      contract_terms_snapshot,
      documents_snapshot,
      remarks,
      updated_by
    ) VALUES (
      ${historyId},
      ${params.employeeId},
      ${params.contractId},
      ${params.effectiveDate},
      ${params.eventType},
      ${params.departmentCode},
      ${params.form.contract.hourlyWage},
      ${trx.json(snapshots.workCondition)},
      ${trx.json(snapshots.contractTerms)},
      ${trx.json(snapshots.documents)},
      ${params.remarks},
      'system'
    )
  `;

  return historyId;
}
