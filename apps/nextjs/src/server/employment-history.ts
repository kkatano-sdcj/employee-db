import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";

import type { EmployeeFormValues } from "@/lib/schemas/employee";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type EmploymentHistorySnapshots = {
  workCondition: JsonValue;
  contractTerms: JsonValue;
  documents: JsonValue;
};

export const buildEmploymentHistorySnapshots = (
  data: EmployeeFormValues,
): EmploymentHistorySnapshots => {
  const workConditionSnapshot: JsonValue = {
    workDaysType: data.workDaysType,
    workDaysCount: data.workDaysCount,
    workDaysCountNote: data.workDaysCountNote ?? null,
    paidLeaveBaseDate: data.paidLeaveBaseDate ?? null,
    workingHours: data.workingHours.map((slot) => ({
      start: slot.start,
      end: slot.end,
    })),
    breakHours: (data.breakHours ?? []).map((slot) => ({
      start: slot.start,
      end: slot.end,
    })),
    workLocations: data.workLocations.map((location) => ({
      companyName: location.companyName ?? null,
      officeName: location.officeName ?? null,
      address: location.address ?? null,
      phoneNumber: location.phoneNumber ?? null,
      location: location.location ?? null,
    })),
    transportationRoutes: data.transportationRoutes.map((route) => ({
      route: route.route ?? null,
      usagePeriod: route.usagePeriod ?? null,
      transportationName: route.transportationName ?? null,
      roundTripAmount: route.roundTripAmount,
      monthlyPassAmount: route.monthlyPassAmount ?? null,
      maxAmount: route.maxAmount ?? null,
      nearestStation: route.nearestStation ?? null,
    })),
  };

  const contractSnapshot: JsonValue = {
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
  };

  const documentsSnapshot: JsonValue = {
    submittedToAdminOn: data.documents.submittedToAdminOn || null,
    returnedToEmployee: data.documents.returnedToEmployee || null,
    expirationNoticeIssued: data.documents.expirationNoticeIssued || null,
    resignationLetterSubmitted: data.documents.resignationLetterSubmitted || null,
    returnHealthInsuranceCard: data.documents.returnHealthInsuranceCard || null,
    returnSecurityCard: data.documents.returnSecurityCard || null,
  };

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
    contractId: string | null;
    departmentCode: string;
    effectiveDate: string;
    eventType: string;
    remarks: string;
    form: EmployeeFormValues;
  },
) {
  const snapshots = buildEmploymentHistorySnapshots(params.form);
  const historyId = randomUUID();
  const hourlyWage = params.form.contract.hourlyWage || null;

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
      created_at,
      updated_at,
      updated_by
    ) VALUES (
      ${historyId},
      ${params.employeeId},
      ${params.contractId},
      ${params.effectiveDate},
      ${params.eventType},
      ${params.departmentCode},
      ${hourlyWage},
      ${trx.json(snapshots.workCondition)},
      ${trx.json(snapshots.contractTerms)},
      ${trx.json(snapshots.documents)},
      ${params.remarks},
      NOW(),
      NOW(),
      'system'
    )
  `;

  return historyId;
}
