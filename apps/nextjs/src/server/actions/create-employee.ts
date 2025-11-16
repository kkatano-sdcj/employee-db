"use server";

import { randomUUID } from "node:crypto";

import { employeeFormSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { db } from "@/server/db";

export async function createEmployee(payload: EmployeeFormValues) {
  const data = employeeFormSchema.parse(payload);

  return db.begin(async (trx) => {
    const employeeId = randomUUID();
    await trx`
      INSERT INTO employees (
        id,
        employee_number,
        branch_number,
        name,
        name_kana,
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

    const contractId = randomUUID();
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

    return { employeeId, contractId };
  });
}
