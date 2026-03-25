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
  const contact = detail.contact;

  const values: EmployeeFormValues = {
    ...base,
    contractNumber: contract?.id ?? base.contractNumber,
    employeeNumber: employee.employeeNumber,
    name: employee.name,
    nameKana: employee.nameKana,
    stickerItem: employee.stickerItem ?? "",
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
    siteCode: employee.siteCode ?? "",
    rehireCount: employee.rehireCount ?? 0,
    originalHireDate: employee.originalHireDate ?? "",
    currentHireDate: employee.currentHireDate ?? "",
    myNumber: employee.myNumber ?? "",
    adminRecords: {
      healthInsuranceCategory: adminRecord?.healthInsuranceCategory ?? "",
      pensionCategory: adminRecord?.pensionCategory ?? "",
      basicPensionNumber: adminRecord?.basicPensionNumber ?? "",
      pensionFundCategory: adminRecord?.pensionFundCategory ?? "",
      employmentInsurance: adminRecord?.employmentInsurance ?? "",
      commutingExpenseCategory: adminRecord?.commutingExpenseCategory ?? "",
      baseSalary: adminRecord?.baseSalary ?? undefined,
      commutingExpensePaymentMethod: adminRecord?.commutingExpensePaymentMethod ?? "",
      dailyPaymentAmount: adminRecord?.dailyPaymentAmount ?? undefined,
    },
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
            companyName: location.companyName ?? "",
            officeName: location.officeName ?? "",
            address: location.address ?? "",
            phoneNumber: location.phoneNumber ?? "",
            location: location.location ?? "",
          }))
        : base.workLocations,
    transportationRoutes:
      workCondition && workCondition.transportationRoutes.length > 0
        ? workCondition.transportationRoutes.map((route) => ({
            route: route.route ?? "",
            usagePeriod: route.usagePeriod ?? "",
            transportationName: route.transportationName ?? "",
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
    contact: {
      residentAddressSame: contact?.residentAddressSame ?? true,
      residentPostalCode: contact?.residentPostalCode ?? "",
      residentAddress1: contact?.residentAddress1 ?? "",
      residentAddress2: contact?.residentAddress2 ?? "",
      residentAddress1Kana: contact?.residentAddress1Kana ?? "",
      residentAddress2Kana: contact?.residentAddress2Kana ?? "",
    },
    documents: {
      healthInsuranceCardSubmitted: adminRecord?.healthInsuranceCardSubmitted ?? "",
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
      subLeaderAllowanceAmount: (contract as { subLeaderAllowanceAmount?: number })?.subLeaderAllowanceAmount ?? undefined,
      perfectAttendanceAllowanceEligible:
        (contract as { perfectAttendanceAllowanceEligible?: boolean })?.perfectAttendanceAllowanceEligible === true,
      jobDescription: contract?.jobDescription ?? "",
      paidLeaveClause: contract?.paidLeaveClause ?? "",
      hourlyWageNote: contract?.hourlyWageNote ?? "",
      specialNote: (contract as { specialNote?: string })?.specialNote ?? "",
      jobDescriptionChangeScope: contract?.jobDescriptionChangeScope ?? "会社の定める業務",
      workLocationChangeScope: contract?.workLocationChangeScope ?? "会社の定める事業所",
      overtimeWork: contract?.overtimeWork ?? true,
      holidayWork: contract?.holidayWork ?? true,
      paidLeaveDays: contract?.paidLeaveDays ?? undefined,
      paidLeaveBaseDateType: contract?.paidLeaveBaseDateType ?? "",
      paidLeaveBaseDate: contract?.paidLeaveBaseDate ?? "",
      disabilityLeaveFrequency: contract?.disabilityLeaveFrequency ?? "",
      commutingAllowanceMax: contract?.commutingAllowanceMax ? Number(contract.commutingAllowanceMax) : 15000,
      retirementAge: contract?.retirementAge ?? undefined,
      retirementDate: contract?.retirementDate ?? "",
      clientHolidayFollow: contract?.clientHolidayFollow ?? false,
      holidaysNote: contract?.holidaysNote ?? "",
      workingHoursNote: contract?.workingHoursNote ?? "",
      pieceworkShiftPattern: contract?.pieceworkShiftPattern ?? "",
      bonusClause: contract?.bonusClause ?? "支給する。額については、個人の業務内容、業務の責任の範囲、会社・組織の業績などに基づき、個人ごとに個別に決定する。",
      employmentInsuranceEnrolled: contract?.employmentInsuranceEnrolled ?? false,
      healthInsuranceEnrolled: contract?.healthInsuranceEnrolled ?? false,
      pensionEnrolled: contract?.pensionEnrolled ?? false,
      pensionFundEnrolled: contract?.pensionFundEnrolled ?? false,
      eligibilityCertRequired: contract?.eligibilityCertRequired ?? false,
    },
  };

  return {
    values,
    workConditionId: workCondition?.id,
    contractId: contract?.id,
  };
}
