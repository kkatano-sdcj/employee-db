"use server";

import { randomUUID } from "node:crypto";

import { employeeFormSchema, type EmployeeFormValues } from "@/lib/schemas/employee";
import { db } from "@/server/db";

type UpdateEmployeeInput = {
  employeeId: string;
  workConditionId?: string | null;
  contractId?: string | null;
  values: EmployeeFormValues;
};

const buildWorkingHoursJson = (values: EmployeeFormValues["workingHours"], keyPrefix: string) =>
  values.map((slot, index) => ({
    id: `${keyPrefix}-wh-${index + 1}`,
    start_time: slot.start,
    end_time: slot.end,
  }));

const buildBreakHoursJson = (
  values: Array<{ start: string; end: string }>,
  keyPrefix: string,
) =>
  values.map((slot, index) => ({
    id: `${keyPrefix}-bh-${index + 1}`,
    start_time: slot.start,
    end_time: slot.end,
  }));

const buildWorkLocationsJson = (
  values: EmployeeFormValues["workLocations"],
  keyPrefix: string,
) =>
  values.map((location, index) => ({
    id: `${keyPrefix}-wl-${index + 1}`,
    location: location.location,
  }));

const buildTransportationRoutesJson = (
  values: EmployeeFormValues["transportationRoutes"],
  keyPrefix: string,
) =>
  values.map((route, index) => ({
    id: `${keyPrefix}-tr-${index + 1}`,
    route: route.route,
    round_trip_amount: route.roundTripAmount,
    monthly_pass_amount: route.monthlyPassAmount ?? null,
    max_amount: route.maxAmount ?? null,
    nearest_station: route.nearestStation || null,
  }));

export async function updateEmployee(input: UpdateEmployeeInput) {
  const { employeeId } = input;
  const data = employeeFormSchema.parse(input.values);

  const workConditionKey = input.workConditionId ?? randomUUID();
  const workingHoursJson = buildWorkingHoursJson(data.workingHours, workConditionKey);
  const breakHoursJson = buildBreakHoursJson(data.breakHours ?? [], workConditionKey);
  const workLocationsJson = buildWorkLocationsJson(data.workLocations, workConditionKey);
  const transportationRoutesJson = buildTransportationRoutesJson(
    data.transportationRoutes,
    workConditionKey,
  );
  const contractKey = input.contractId ?? randomUUID();

  await db.begin(async (trx) => {
    await trx`
      UPDATE employees
      SET
        employee_number = ${data.employeeNumber},
        name = ${data.name},
        name_kana = ${data.nameKana},
        gender = ${data.gender},
        birth_date = ${data.birthDate},
        nationality = ${data.nationality || null},
        hired_at = ${data.hiredAt},
        employment_type = ${data.employmentType},
        employment_status = ${data.employmentStatus},
        department_code = ${data.departmentCode},
        my_number = ${data.myNumber || null},
        updated_by = 'system',
        updated_at = NOW()
      WHERE id = ${employeeId}
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
    } else {
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
          updated_by = 'system',
          updated_at = NOW()
        WHERE id = ${input.contractId}
      `;
    } else {
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
          'system'
        )
      `;
    }
  });

  return {
    employeeId,
    workConditionId: workConditionKey,
    contractId: contractKey,
  };
}
