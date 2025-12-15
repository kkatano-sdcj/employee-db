"use server";

import { randomUUID } from "node:crypto";

import { createEmployeeFormSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { db } from "@/server/db";
import { insertEmploymentHistoryFromForm } from "@/server/employment-history";

export async function createEmployee(payload: EmployeeFormValues) {
  const schema = createEmployeeFormSchema("create");
  const data = schema.parse(payload);

  return db.begin(async (trx) => {
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
        'system'
      )
    `;

    const workConditionId = randomUUID();
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
        'system'
      )
    `;

    for (const slot of data.workingHours) {
      await trx`
        INSERT INTO working_hours (id, work_condition_id, start_time, end_time)
        VALUES (${randomUUID()}, ${workConditionId}, ${slot.start}, ${slot.end})
      `;
    }

    if (data.breakHours) {
      for (const slot of data.breakHours) {
        await trx`
          INSERT INTO break_hours (id, work_condition_id, start_time, end_time)
          VALUES (${randomUUID()}, ${workConditionId}, ${slot.start}, ${slot.end})
        `;
      }
    }

    for (const location of data.workLocations) {
      await trx`
        INSERT INTO work_locations (id, work_condition_id, location)
        VALUES (${randomUUID()}, ${workConditionId}, ${location.location})
      `;
    }

    for (const route of data.transportationRoutes) {
      await trx`
        INSERT INTO transportation_routes (
          id,
          work_condition_id,
          route,
          round_trip_amount,
          monthly_pass_amount,
          max_amount,
          nearest_station
        ) VALUES (
          ${randomUUID()},
          ${workConditionId},
          ${route.route},
          ${route.roundTripAmount},
          ${route.monthlyPassAmount ?? null},
          ${route.maxAmount ?? null},
          ${route.nearestStation || null}
        )
      `;
    }

    const contractId = data.contractNumber?.trim() || randomUUID();
    await trx`
      INSERT INTO contracts (
        id,
        employee_id,
        contract_type,
        contract_start_date,
        contract_end_date,
        is_renewable,
        hourly_wage,
        hourly_wage_note,
        overtime_hourly_wage,
        job_description,
        paid_leave_clause,
        termination_alert_flag,
        status,
        updated_by
      ) VALUES (
        ${contractId},
        ${employeeId},
        ${data.contract.contractType},
        ${data.contract.contractStartDate},
        ${data.contract.contractEndDate || null},
        ${data.contract.isRenewable},
        ${data.contract.hourlyWage},
        ${data.contract.hourlyWageNote || null},
        ${data.contract.overtimeHourlyWage ?? null},
        ${data.contract.jobDescription || null},
        ${data.contract.paidLeaveClause || null},
        false,
        'DRAFT',
        'system'
      )
    `;

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

    await insertEmploymentHistoryFromForm(trx, {
      employeeId,
      contractId,
      departmentCode: data.departmentCode,
      effectiveDate: data.contract.contractStartDate,
      eventType: "HIRE",
      remarks: "契約登録",
      form: data,
    });

    return { employeeId, contractId };
  });
}
