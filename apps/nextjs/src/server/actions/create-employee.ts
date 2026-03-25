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

export async function createEmployee(payload: EmployeeFormValues) {
  // employee-management コンテキストでは契約・勤務条件の一部が空のため、
  // サーバー側は緩いバリデーションを適用しデフォルト値で補完する
  const schema = createEmployeeFormSchema("create", "employee-management");
  const data = schema.parse(payload);

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
  const hasWorkConditionData =
    hasWorkHours || hasTransportation || hasWorkLocations || hasBreakHours;

  // 契約情報に有効なデータがあるか判定
  const hasContract =
    (data.contract.contractStartDate?.trim() ?? "") !== "" ||
    (data.contractNumber?.trim() ?? "") !== "";

  return db.begin(async (trx: Sql) => {
    const employeeId = randomUUID();
    await trx`
      INSERT INTO employees (
        id,
        employee_number,
        branch_number,
        name,
        name_kana,
        sticker_item,
        gender,
        birth_date,
        nationality,
        hired_at,
        employment_type,
        employment_status,
        department_code,
        my_number,
        site_code,
        rehire_count,
        original_hire_date,
        current_hire_date,
        created_at,
        updated_at,
        updated_by
      )
      VALUES (
        ${employeeId},
        ${data.employeeNumber},
        0,
        ${data.name},
        ${data.nameKana},
        ${data.stickerItem || null},
        ${data.gender},
        ${data.birthDate},
        ${data.nationality || null},
        ${data.hiredAt},
        ${data.employmentType},
        ${data.employmentStatus},
        ${data.departmentCode},
        ${data.myNumber || null},
        ${data.siteCode || null},
        ${data.rehireCount ?? 0},
        ${data.originalHireDate || null},
        ${data.currentHireDate || null},
        NOW(),
        NOW(),
        'system'
      )
    `;

    // 連絡先情報
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

    // 勤務条件（JSONB。通勤費のみの登録にも対応）
    let workConditionId: string | null = null;
    if (hasWorkConditionData) {
      workConditionId = randomUUID();
      const workingHoursJson = buildWorkingHoursJson(data.workingHours, workConditionId);
      const breakHoursJson = buildBreakHoursJson(data.breakHours ?? [], workConditionId);
      const workLocationsJson = buildWorkLocationsJson(data.workLocations, workConditionId);
      const transportationRoutesJson = buildTransportationRoutesJson(
        data.transportationRoutes,
        workConditionId,
      );

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
          created_at,
          updated_at,
          updated_by
        ) VALUES (
          ${workConditionId},
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
          NOW(),
          NOW(),
          'system'
        )
      `;
    }

    // 契約情報（データがある場合のみ作成）
    let contractId: string | null = null;
    if (hasContract) {
      // FR-097: 契約番号を自動生成（{employee_number}-CON{5桁連番}）
      contractId = await generateContractNumber(data.employeeNumber);
      const contractStartDate = data.contract.contractStartDate || data.hiredAt;
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
          created_at,
          updated_at,
          updated_by
        ) VALUES (
          ${contractId},
          ${employeeId},
          ${data.contract.contractType},
          ${contractStartDate},
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
          NOW(),
          NOW(),
          'system'
        )
      `;

      // FR-065/066: employment_history へ自動追記
      await insertEmploymentHistoryFromForm(trx, {
        employeeId,
        contractId,
        departmentCode: data.departmentCode,
        effectiveDate: contractStartDate,
        eventType: "HIRE",
        remarks: "新規雇用契約",
        form: data,
      });
    }

    // employee_admin_records テーブルへの保存
    if (data.adminRecords) {
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
          created_at,
          updated_at,
          updated_by
        ) VALUES (
          ${randomUUID()},
          ${employeeId},
          ${data.adminRecords.healthInsuranceCategory || null},
          ${data.adminRecords.pensionCategory || null},
          ${data.adminRecords.basicPensionNumber || null},
          ${data.adminRecords.pensionFundCategory || null},
          ${data.adminRecords.employmentInsurance || null},
          ${data.adminRecords.baseSalary ?? null},
          ${data.adminRecords.commutingExpenseCategory || null},
          ${data.adminRecords.commutingExpensePaymentMethod || null},
          ${data.adminRecords.dailyPaymentAmount ?? null},
          NOW(),
          NOW(),
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
          updated_by = 'system',
          updated_at = NOW()
      `;
    }

    return { employeeId, contractId };
  });
}
