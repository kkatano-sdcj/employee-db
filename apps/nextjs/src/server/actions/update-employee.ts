"use server";

import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";

import { createEmployeeFormSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { db } from "@/server/db";
import { generateContractNumber } from "@/server/actions/contracts";
import { insertEmploymentHistoryFromForm } from "@/server/employment-history";
import {
  buildBreakHoursJson,
  buildTransportationRoutesJson,
  buildWorkLocationsJson,
  buildWorkingHoursJson,
} from "@/server/work-condition-json";

type UpdateEmployeeInput = {
  employeeId: string;
  workConditionId?: string | null;
  contractId?: string | null;
  values: EmployeeFormValues;
  /** クライアントの EmployeeForm context と一致させる（省略時は all） */
  formContext?: "employee-management" | "contract-management" | "all";
};

function hasWorkConditionPayload(data: EmployeeFormValues) {
  const hasTransportation = data.transportationRoutes.some((r) =>
    Boolean(
      r.route?.trim() ||
        r.usagePeriod?.trim() ||
        r.transportationName?.trim() ||
        r.roundTripAmount > 0 ||
        (r.monthlyPassAmount != null && r.monthlyPassAmount > 0),
    ),
  );
  const hasWorkHours =
    data.workingHours.length > 0 && data.workingHours.some((h) => h.start && h.end);
  const hasWorkLocations = data.workLocations.some(
    (l) =>
      Boolean(
        l.location?.trim() ||
          l.companyName?.trim() ||
          l.officeName?.trim() ||
          l.address?.trim() ||
          l.phoneNumber?.trim(),
      ),
  );
  const hasBreakHours = (data.breakHours ?? []).some((b) => b.start && b.end);
  return hasWorkHours || hasTransportation || hasWorkLocations || hasBreakHours;
}

export async function updateEmployee(input: UpdateEmployeeInput) {
  const { employeeId } = input;
  const formContext = input.formContext ?? "all";
  const schema = createEmployeeFormSchema("edit", formContext);
  const data = schema.parse(input.values);

  const workConditionKey = input.workConditionId ?? randomUUID();
  // FR-097: 新規契約の場合は自動生成、既存契約はそのまま
  const contractKey = input.contractId
    ? input.contractId
    : await generateContractNumber(data.employeeNumber);
  const workingHoursJson = buildWorkingHoursJson(data.workingHours, workConditionKey);
  const breakHoursJson = buildBreakHoursJson(data.breakHours ?? [], workConditionKey);
  const workLocationsJson = buildWorkLocationsJson(data.workLocations, workConditionKey);
  const transportationRoutesJson = buildTransportationRoutesJson(
    data.transportationRoutes,
    workConditionKey,
  );
  await db.begin(async (trx: Sql) => {
    await trx`
      UPDATE employees
      SET
        employee_number = ${data.employeeNumber},
        name = ${data.name},
        name_kana = ${data.nameKana},
        sticker_item = ${data.stickerItem || null},
        gender = ${data.gender},
        birth_date = ${data.birthDate},
        nationality = ${data.nationality || null},
        hired_at = ${data.hiredAt},
        employment_type = ${data.employmentType},
        employment_status = ${data.employmentStatus},
        department_code = ${data.departmentCode},
        my_number = ${data.myNumber || null},
        site_code = ${data.siteCode || null},
        rehire_count = ${data.rehireCount ?? 0},
        original_hire_date = ${data.originalHireDate || null},
        current_hire_date = ${data.currentHireDate || null},
        updated_by = 'system',
        updated_at = NOW()
      WHERE id = ${employeeId}
    `;

    // 連絡先情報（住民票住所）
    await trx`
      INSERT INTO employee_contacts (
        id,
        employee_id,
        resident_address_same,
        resident_postal_code,
        resident_address1,
        resident_address2,
        resident_address1_kana,
        resident_address2_kana,
        created_at,
        updated_at,
        updated_by
      ) VALUES (
        ${randomUUID()},
        ${employeeId},
        ${data.contact?.residentAddressSame ?? true},
        ${data.contact?.residentPostalCode || null},
        ${data.contact?.residentAddress1 || null},
        ${data.contact?.residentAddress2 || null},
        ${data.contact?.residentAddress1Kana || null},
        ${data.contact?.residentAddress2Kana || null},
        NOW(),
        NOW(),
        'system'
      )
      ON CONFLICT (employee_id) DO UPDATE SET
        resident_address_same = EXCLUDED.resident_address_same,
        resident_postal_code = EXCLUDED.resident_postal_code,
        resident_address1 = EXCLUDED.resident_address1,
        resident_address2 = EXCLUDED.resident_address2,
        resident_address1_kana = EXCLUDED.resident_address1_kana,
        resident_address2_kana = EXCLUDED.resident_address2_kana,
        updated_by = 'system',
        updated_at = NOW()
    `;

    if (input.workConditionId) {
      await trx`
        UPDATE work_conditions
        SET
          work_days_type = ${data.workDaysType},
          work_days_count = ${data.workDaysCount},
          work_days_count_note = ${data.workDaysCountNote || null},
          paid_leave_base_date = ${data.paidLeaveBaseDate || null},
          working_hours_jsonb = ${trx.json(workingHoursJson)},
          break_hours_jsonb = ${trx.json(breakHoursJson)},
          work_locations_jsonb = ${trx.json(workLocationsJson)},
          transportation_routes_jsonb = ${trx.json(transportationRoutesJson)},
          updated_by = 'system',
          updated_at = NOW()
        WHERE id = ${input.workConditionId}
      `;
    } else if (hasWorkConditionPayload(data)) {
      await trx`
        INSERT INTO work_conditions (
          id,
          employee_id,
          effective_from,
          effective_to,
          work_days_type,
          work_days_count,
          work_days_count_note,
          paid_leave_base_date,
          working_hours_jsonb,
          break_hours_jsonb,
          work_locations_jsonb,
          transportation_routes_jsonb,
          updated_by
        ) VALUES (
          ${workConditionKey},
          ${employeeId},
          ${data.hiredAt},
          NULL,
          ${data.workDaysType},
          ${data.workDaysCount},
          ${data.workDaysCountNote || null},
          ${data.paidLeaveBaseDate || null},
          ${trx.json(workingHoursJson)},
          ${trx.json(breakHoursJson)},
          ${trx.json(workLocationsJson)},
          ${trx.json(transportationRoutesJson)},
          'system'
        )
      `;
    }

    if (input.contractId) {
      await trx`
        UPDATE contracts
        SET
          contract_type = ${data.contract.contractType},
          contract_start_date = ${data.contract.contractStartDate},
          contract_end_date = ${data.contract.contractEndDate || null},
          employment_expiry_scheduled_date = ${data.contract.contractEndDate || null},
          hourly_wage = ${data.contract.hourlyWage},
          hourly_wage_note = ${data.contract.hourlyWageNote || null},
          overtime_hourly_wage = ${data.contract.overtimeHourlyWage ?? null},
          job_description = ${data.contract.jobDescription || null},
          paid_leave_clause = ${data.contract.paidLeaveClause || null},
          is_renewable = ${data.contract.isRenewable},
          job_description_change_scope = ${data.contract.jobDescriptionChangeScope || '会社の定める業務'},
          work_location_change_scope = ${data.contract.workLocationChangeScope || '会社の定める事業所'},
          overtime_work = ${data.contract.overtimeWork ?? true},
          holiday_work = ${data.contract.holidayWork ?? true},
          paid_leave_days = ${data.contract.paidLeaveDays || null},
          paid_leave_base_date_type = ${data.contract.paidLeaveBaseDateType || null},
          paid_leave_base_date = ${data.contract.paidLeaveBaseDate || null},
          disability_leave_frequency = ${data.contract.disabilityLeaveFrequency || null},
          commuting_allowance_max = ${data.contract.commutingAllowanceMax ?? 15000},
          retirement_age = ${data.contract.retirementAge || null},
          retirement_date = ${data.contract.retirementDate || null},
          client_holiday_follow = ${data.contract.clientHolidayFollow ?? false},
          holidays_note = ${data.contract.holidaysNote || null},
          working_hours_note = ${data.contract.workingHoursNote || null},
          piecework_shift_pattern = ${data.contract.pieceworkShiftPattern || null},
          bonus_clause = ${data.contract.bonusClause || null},
          employment_insurance_enrolled = ${data.contract.employmentInsuranceEnrolled ?? false},
          health_insurance_enrolled = ${data.contract.healthInsuranceEnrolled ?? false},
          pension_enrolled = ${data.contract.pensionEnrolled ?? false},
          pension_fund_enrolled = ${data.contract.pensionFundEnrolled ?? false},
          eligibility_cert_required = ${data.contract.eligibilityCertRequired ?? false},
          updated_by = 'system',
          updated_at = NOW()
        WHERE id = ${input.contractId}
      `;
    } else if (formContext === "contract-management") {
      await trx`
        INSERT INTO contracts (
          id,
          employee_id,
          contract_type,
          contract_start_date,
          contract_end_date,
          employment_expiry_scheduled_date,
          is_renewable,
          hourly_wage,
          hourly_wage_note,
          overtime_hourly_wage,
          job_description,
          paid_leave_clause,
          termination_alert_flag,
          status,
          job_description_change_scope,
          work_location_change_scope,
          overtime_work,
          holiday_work,
          paid_leave_days,
          paid_leave_base_date_type,
          paid_leave_base_date,
          disability_leave_frequency,
          commuting_allowance_max,
          retirement_age,
          retirement_date,
          client_holiday_follow,
          holidays_note,
          working_hours_note,
          piecework_shift_pattern,
          bonus_clause,
          employment_insurance_enrolled,
          health_insurance_enrolled,
          pension_enrolled,
          pension_fund_enrolled,
          eligibility_cert_required,
          updated_by
        ) VALUES (
          ${contractKey},
          ${employeeId},
          ${data.contract.contractType},
          ${data.contract.contractStartDate},
          ${data.contract.contractEndDate || null},
          ${data.contract.contractEndDate || null},
          ${data.contract.isRenewable},
          ${data.contract.hourlyWage},
          ${data.contract.hourlyWageNote || null},
          ${data.contract.overtimeHourlyWage ?? null},
          ${data.contract.jobDescription || null},
          ${data.contract.paidLeaveClause || null},
          false,
          'DRAFT',
          ${data.contract.jobDescriptionChangeScope || '会社の定める業務'},
          ${data.contract.workLocationChangeScope || '会社の定める事業所'},
          ${data.contract.overtimeWork ?? true},
          ${data.contract.holidayWork ?? true},
          ${data.contract.paidLeaveDays || null},
          ${data.contract.paidLeaveBaseDateType || null},
          ${data.contract.paidLeaveBaseDate || null},
          ${data.contract.disabilityLeaveFrequency || null},
          ${data.contract.commutingAllowanceMax ?? 15000},
          ${data.contract.retirementAge || null},
          ${data.contract.retirementDate || null},
          ${data.contract.clientHolidayFollow ?? false},
          ${data.contract.holidaysNote || null},
          ${data.contract.workingHoursNote || null},
          ${data.contract.pieceworkShiftPattern || null},
          ${data.contract.bonusClause || null},
          ${data.contract.employmentInsuranceEnrolled ?? false},
          ${data.contract.healthInsuranceEnrolled ?? false},
          ${data.contract.pensionEnrolled ?? false},
          ${data.contract.pensionFundEnrolled ?? false},
          ${data.contract.eligibilityCertRequired ?? false},
          'system'
        )
      `;
    }

    const [existingAdminRecord] = await trx<[{ id: string }] | []>`
      SELECT id FROM employee_admin_records WHERE employee_id = ${employeeId} LIMIT 1
    `;
    const adminRecordId = existingAdminRecord?.id ?? randomUUID();

    await trx`
      INSERT INTO employee_admin_records (
        id,
        employee_id,
        health_insurance_category,
        pension_category,
        basic_pension_number,
        pension_fund_category,
        employment_insurance_number,
        base_salary,
        commuting_expense_category,
        commuting_expense_payment_method,
        daily_payment_amount,
        submitted_to_admin_on,
        returned_to_employee,
        expiration_notice_issued,
        resignation_letter_submitted,
        return_health_insurance_card,
        return_security_card,
        updated_by
      ) VALUES (
        ${adminRecordId},
        ${employeeId},
        ${data.adminRecords?.healthInsuranceCategory || null},
        ${data.adminRecords?.pensionCategory || null},
        ${data.adminRecords?.basicPensionNumber || null},
        ${data.adminRecords?.pensionFundCategory || null},
        ${data.adminRecords?.employmentInsurance || null},
        ${data.adminRecords?.baseSalary ?? null},
        ${data.adminRecords?.commutingExpenseCategory || null},
        ${data.adminRecords?.commutingExpensePaymentMethod || null},
        ${data.adminRecords?.dailyPaymentAmount ?? null},
        ${data.documents.submittedToAdminOn || null},
        ${data.documents.returnedToEmployee || null},
        ${data.documents.expirationNoticeIssued || null},
        ${data.documents.resignationLetterSubmitted || null},
        ${data.documents.returnHealthInsuranceCard || null},
        ${data.documents.returnSecurityCard || null},
        'system'
      )
      ON CONFLICT (employee_id) DO UPDATE SET
        health_insurance_category = EXCLUDED.health_insurance_category,
        pension_category = EXCLUDED.pension_category,
        basic_pension_number = EXCLUDED.basic_pension_number,
        pension_fund_category = EXCLUDED.pension_fund_category,
        employment_insurance_number = EXCLUDED.employment_insurance_number,
        base_salary = EXCLUDED.base_salary,
        commuting_expense_category = EXCLUDED.commuting_expense_category,
        commuting_expense_payment_method = EXCLUDED.commuting_expense_payment_method,
        daily_payment_amount = EXCLUDED.daily_payment_amount,
        submitted_to_admin_on = EXCLUDED.submitted_to_admin_on,
        returned_to_employee = EXCLUDED.returned_to_employee,
        expiration_notice_issued = EXCLUDED.expiration_notice_issued,
        resignation_letter_submitted = EXCLUDED.resignation_letter_submitted,
        return_health_insurance_card = EXCLUDED.return_health_insurance_card,
        return_security_card = EXCLUDED.return_security_card,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
    `;

    await insertEmploymentHistoryFromForm(trx, {
      employeeId,
      contractId: contractKey,
      departmentCode: data.departmentCode,
      effectiveDate: data.contract.contractStartDate,
      eventType: "CONTRACT_UPDATE",
      remarks: "契約更新",
      form: data,
    });
  });

  return {
    employeeId,
    workConditionId: workConditionKey,
    contractId: contractKey,
  };
}
