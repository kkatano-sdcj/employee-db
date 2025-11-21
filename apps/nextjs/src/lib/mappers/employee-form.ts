import {
  defaultEmployeeFormValues,
  type EmployeeFormValues,
} from "@/lib/schemas/employee";
import type { EmployeeDetail } from "@/server/queries/employees";

const cloneDefaultValues = (): EmployeeFormValues => ({
  ...defaultEmployeeFormValues,
  workingHours: defaultEmployeeFormValues.workingHours.map((slot) => ({
    ...slot,
  })),
  breakHours: defaultEmployeeFormValues.breakHours
    ? defaultEmployeeFormValues.breakHours.map((slot) => ({ ...slot }))
    : [],
  workLocations: defaultEmployeeFormValues.workLocations.map((location) => ({
    ...location,
  })),
  transportationRoutes: defaultEmployeeFormValues.transportationRoutes.map((route) => ({
    ...route,
  })),
  documents: { ...defaultEmployeeFormValues.documents },
  contract: {
    ...defaultEmployeeFormValues.contract,
  },
});

export type EmployeeFormPrefill = {
  values: EmployeeFormValues;
  workConditionId?: string;
  contractId?: string;
};

export function mapEmployeeDetailToFormValues(detail: EmployeeDetail): EmployeeFormPrefill {
  const employee = detail.employee;
  const base = cloneDefaultValues();

  if (!employee) {
    return { values: base };
  }

  const workCondition = detail.workConditions[0];
  const contract = detail.contracts[0];
  const adminRecord = detail.adminRecord;

  const values: EmployeeFormValues = {
    ...base,
    contractNumber: contract?.id ?? base.contractNumber,
    employeeNumber: employee.employeeNumber,
    name: employee.name,
    nameKana: employee.nameKana,
    gender: (employee.gender as EmployeeFormValues["gender"]) ?? base.gender,
    birthDate: employee.birthDate ?? "",
    nationality: employee.nationality ?? "",
    hiredAt: employee.hiredAt ?? "",
    employmentType:
      (employee.employmentType as EmployeeFormValues["employmentType"]) ??
      base.employmentType,
    employmentStatus:
      (employee.employmentStatus as EmployeeFormValues["employmentStatus"]) ??
      base.employmentStatus,
    departmentCode: employee.departmentCode,
    myNumber: employee.myNumber ?? "",
    workDaysType:
      (workCondition?.workDaysType as EmployeeFormValues["workDaysType"]) ??
      base.workDaysType,
    workDaysCount: workCondition?.workDaysCount ?? base.workDaysCount,
    workDaysCountNote: workCondition?.workDaysCountNote ?? "",
    paidLeaveBaseDate: workCondition?.paidLeaveBaseDate ?? "",
    workingHours:
      workCondition && workCondition.workingHours.length > 0
        ? workCondition.workingHours.map((slot) => ({
            start: slot.start ?? "",
            end: slot.end ?? "",
          }))
        : base.workingHours,
    breakHours:
      workCondition && workCondition.breakHours.length > 0
        ? workCondition.breakHours.map((slot) => ({
            start: slot.start ?? "",
            end: slot.end ?? "",
          }))
        : [],
    workLocations:
      workCondition && workCondition.workLocations.length > 0
        ? workCondition.workLocations.map((location) => ({
            location: location.location ?? "",
          }))
        : base.workLocations,
    transportationRoutes:
      workCondition && workCondition.transportationRoutes.length > 0
        ? workCondition.transportationRoutes.map((route) => ({
            route: route.route ?? "",
            roundTripAmount: Number(route.roundTripAmount ?? 0),
            monthlyPassAmount:
              typeof route.monthlyPassAmount === "number"
                ? Number(route.monthlyPassAmount)
                : undefined,
            maxAmount:
              typeof route.maxAmount === "number" ? Number(route.maxAmount) : undefined,
            nearestStation: route.nearestStation ?? "",
          }))
        : base.transportationRoutes,
    documents: {
      submittedToAdminOn: adminRecord?.submittedToAdminOn ?? "",
      returnedToEmployee: adminRecord?.returnedToEmployee ?? "",
      expirationNoticeIssued: adminRecord?.expirationNoticeIssued ?? "",
      resignationLetterSubmitted: adminRecord?.resignationLetterSubmitted ?? "",
      returnHealthInsuranceCard: adminRecord?.returnHealthInsuranceCard ?? "",
      returnSecurityCard: adminRecord?.returnSecurityCard ?? "",
    },
    contract: {
      ...base.contract,
      contractType:
        (contract?.contractType as EmployeeFormValues["contract"]["contractType"]) ??
        base.contract.contractType,
      contractStartDate: contract?.contractStartDate ?? "",
      contractEndDate: contract?.contractEndDate ?? "",
      isRenewable:
        typeof contract?.isRenewable === "boolean"
          ? contract.isRenewable
          : base.contract.isRenewable,
      hourlyWage: contract?.hourlyWage ?? base.contract.hourlyWage,
      overtimeHourlyWage: contract?.overtimeHourlyWage ?? undefined,
      jobDescription: contract?.jobDescription ?? "",
      paidLeaveClause: contract?.paidLeaveClause ?? "",
      hourlyWageNote: contract?.hourlyWageNote ?? "",
    },
  };

  return {
    values,
    workConditionId: workCondition?.id,
    contractId: contract?.id,
  };
}
