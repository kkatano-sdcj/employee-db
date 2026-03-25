import { db } from "@/server/db";
import type { CurrentUser } from "@/lib/rbac";
import { canAccessHourlyWage, canAccessMyNumber, getDepartmentFilter } from "@/lib/rbac";

const toDateString = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toISOString().slice(0, 10);
};

const toDateTimeString = (value: Date | string | null | undefined) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
};

export type EmployeeListItem = {
  id: string;
  employeeNumber: string;
  name: string;
  employmentType: string;
  employmentStatus: string;
  departmentCode: string;
  siteCode?: string;
  hourlyWage?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  employmentExpiryScheduledDate?: string;
  needsContractUpdate: boolean;
  updatedAt?: string;
};

const statusValueMap: Record<string, string> = {
  ACTIVE: "ACTIVE",
  INACTIVE: "RETIRED",
  RETIRED: "RETIRED",
  SUSPENDED: "ON_LEAVE",
  ON_LEAVE: "ON_LEAVE",
};

export type EmployeeSearchOptions = {
  query?: string;
  status?: string;
  employmentType?: string;
  department?: string;
  contractFrom?: string;
  contractTo?: string;
  minHourlyWage?: number;
  maxHourlyWage?: number;
  hasDocuments?: boolean;
  hasAlert?: boolean;
  limit?: number;
  offset?: number;
  /** RBAC: 現在のユーザー（行レベル/列レベル制御用） */
  currentUser?: CurrentUser | null;
};

export async function fetchEmployees(options: EmployeeSearchOptions = {}) {
  const {
    query,
    status,
    employmentType,
    department,
    contractFrom,
    contractTo,
    minHourlyWage,
    maxHourlyWage,
    hasDocuments,
    hasAlert,
    limit = 25,
    offset = 0,
    currentUser,
  } = options;

  // RBAC行レベル制御: FIELD_MANAGERは自部門のみ
  const departmentFilter = currentUser ? getDepartmentFilter(currentUser) : null;
  const effectiveDepartment = departmentFilter ?? department;
  const normalizedStatus =
    status && status !== "ALL" ? statusValueMap[status] ?? status : undefined;

  const rows = await db<
    Array<{
      id: string;
      employeeNumber: string;
      name: string;
      employmentType: string;
      employmentStatus: string;
      departmentCode: string;
      siteCode: string | null;
      updatedAt: Date | string | null;
      contractStartDate: Date | string | null;
      contractEndDate: Date | string | null;
      employmentExpiryScheduledDate: Date | string | null;
      hourlyWage?: number;
      needsContractUpdate: boolean;
    }>
  >`
    SELECT
      e.id,
      e.employee_number as "employeeNumber",
      e.name,
      e.employment_type as "employmentType",
      e.employment_status as "employmentStatus",
      e.department_code as "departmentCode",
      e.site_code as "siteCode",
      e.updated_at as "updatedAt",
      c.contract_start_date as "contractStartDate",
      c.contract_end_date as "contractEndDate",
      c.employment_expiry_scheduled_date as "employmentExpiryScheduledDate",
      c.hourly_wage as "hourlyWage",
      EXISTS (
        SELECT 1
        FROM contracts c_alert
        WHERE c_alert.employee_id = e.id
          AND c_alert.employment_expiry_scheduled_date IS NOT NULL
          AND c_alert.employment_expiry_scheduled_date < CURRENT_DATE
      ) as "needsContractUpdate"
    FROM employees e
    LEFT JOIN LATERAL (
      SELECT contract_start_date, contract_end_date, employment_expiry_scheduled_date, hourly_wage
      FROM contracts c
      WHERE c.employee_id = e.id
      ORDER BY c.contract_start_date DESC
      LIMIT 1
    ) c ON TRUE
    WHERE TRUE
    ${query ? db`AND (e.name ILIKE ${"%" + query + "%"} OR e.name_kana ILIKE ${"%" + query + "%"} OR e.employee_number ILIKE ${"%" + query + "%"})` : db``}
    ${normalizedStatus ? db`AND e.employment_status = ${normalizedStatus}` : db``}
    ${employmentType && employmentType !== "ALL" ? db`AND e.employment_type = ${employmentType}` : db``}
    ${effectiveDepartment ? db`AND e.department_code = ${effectiveDepartment}` : db``}
    ${
      contractFrom
        ? db`AND (c.contract_start_date IS NULL OR c.contract_start_date >= ${contractFrom})`
        : db``
    }
    ${
      contractTo
        ? db`AND (c.contract_start_date IS NULL OR c.contract_start_date <= ${contractTo})`
        : db``
    }
    ${
      typeof minHourlyWage === "number"
        ? db`AND (c.hourly_wage IS NULL OR c.hourly_wage >= ${minHourlyWage})`
        : db``
    }
    ${
      typeof maxHourlyWage === "number"
        ? db`AND (c.hourly_wage IS NULL OR c.hourly_wage <= ${maxHourlyWage})`
        : db``
    }
    ${
      hasDocuments
        ? db`AND EXISTS (
            SELECT 1 FROM employee_admin_records docs
            WHERE docs.employee_id = e.id
              AND (
                docs.return_health_insurance_card IS NULL
                OR docs.return_security_card IS NULL
                OR docs.submitted_to_admin_on IS NULL
              )
          )`
        : db``
    }
    ${
      hasAlert
        ? db`AND EXISTS (
            SELECT 1 FROM contracts ca
            WHERE ca.employee_id = e.id
              AND ca.employment_expiry_scheduled_date IS NOT NULL
              AND ca.employment_expiry_scheduled_date < CURRENT_DATE
          )`
        : db``
    }
    ORDER BY e.updated_at DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `;

  // RBAC列レベル制御: 権限に基づいてフィールドをマスク
  const showHourlyWage = currentUser ? canAccessHourlyWage(currentUser.role) : true;

  return rows.map((row) => ({
    ...row,
    siteCode: row.siteCode ?? undefined,
    contractStartDate: toDateString(row.contractStartDate as unknown as Date),
    contractEndDate: toDateString(row.contractEndDate as unknown as Date),
    employmentExpiryScheduledDate: toDateString(
      row.employmentExpiryScheduledDate as unknown as Date,
    ),
    updatedAt: toDateTimeString(row.updatedAt as unknown as Date),
    needsContractUpdate: Boolean(row.needsContractUpdate),
    // 列レベル制御: FIELD_MANAGER以上のみ時給を閲覧可能
    hourlyWage: showHourlyWage ? row.hourlyWage : undefined,
  }));
}

export type EmployeeDetail = {
  employee: {
    id: string;
    employeeNumber: string;
    branchNumber: number;
    name: string;
    nameKana: string;
    stickerItem?: string;
    gender: string;
    birthDate?: string;
    nationality?: string;
    hiredAt?: string;
    rehiredAt?: string;
    retiredAt?: string;
    employmentType: string;
    employmentStatus: string;
    departmentCode: string;
    siteCode?: string;
    rehireCount: number;
    originalHireDate?: string;
    currentHireDate?: string;
    myNumber?: string;
    updatedAt?: string;
  } | null;
  contact: {
    postalCode?: string;
    address1?: string;
    address2?: string;
    address1Kana?: string;
    address2Kana?: string;
    phone1?: string;
    email1?: string;
    residentAddressSame?: boolean;
    residentPostalCode?: string;
    residentAddress1?: string;
    residentAddress2?: string;
    residentAddress1Kana?: string;
    residentAddress2Kana?: string;
  } | null;
  bankAccounts: Array<{
    id: string;
    paymentPriority: number;
    handlingCategory?: string;
    paymentCategory?: string;
    bankCode?: string;
    bankName?: string;
    branchCode?: string;
    branchName?: string;
    depositType?: string;
    accountNumber?: string;
    accountHolderName?: string;
    isActive: boolean;
  }>;
  workConditions: Array<{
    id: string;
    effectiveFrom?: string;
    effectiveTo?: string | null;
    workDaysType: string;
    workDaysCount: number;
    workDaysCountNote?: string | null;
    paidLeaveBaseDate?: string | null;
    workingHours: Array<{ start: string; end: string }>;
    breakHours: Array<{ start: string; end: string }>;
    workLocations: Array<{
      location: string;
      companyName: string;
      officeName: string;
      address: string;
      phoneNumber: string;
    }>;
    transportationRoutes: Array<{
      route: string;
      usagePeriod: string;
      transportationName: string;
      roundTripAmount: number;
      monthlyPassAmount?: number | null;
      maxAmount?: number | null;
      nearestStation?: string | null;
    }>;
  }>;
  contracts: Array<{
    id: string;
    contractType: string;
    contractStartDate?: string;
    contractEndDate?: string | null;
    isRenewable: boolean;
    employmentExpiryScheduledDate?: string | null;
    employmentExpiryDate?: string | null;
    needsUpdate: boolean;
    hourlyWage: number;
    hourlyWageNote?: string | null;
    overtimeHourlyWage?: number | null;
    jobDescription?: string | null;
    paidLeaveClause?: string | null;
    status: string;
    wageType?: string;
    subLeaderAllowanceAmount?: number | null;
    perfectAttendanceAllowanceEligible?: boolean;
    jobDescriptionChangeScope?: string | null;
    workLocationChangeScope?: string | null;
    overtimeWork?: boolean;
    holidayWork?: boolean;
    paidLeaveDays?: number | null;
    paidLeaveBaseDateType?: string | null;
    paidLeaveBaseDate?: string | null;
    disabilityLeaveFrequency?: string | null;
    commutingAllowanceMax?: number | null;
    retirementAge?: number | null;
    retirementDate?: string | null;
    clientHolidayFollow?: boolean;
    holidaysNote?: string | null;
    workingHoursNote?: string | null;
    pieceworkShiftPattern?: string | null;
    bonusClause?: string | null;
    employmentInsuranceEnrolled?: boolean;
    healthInsuranceEnrolled?: boolean;
    pensionEnrolled?: boolean;
    pensionFundEnrolled?: boolean;
    eligibilityCertRequired?: boolean;
    updatedAt?: string;
  }>;
  employmentHistory: Array<{
    id: string;
    contractId?: string | null;
    eventType: string;
    effectiveDate?: string;
    departmentCode?: string | null;
    grade?: string | null;
    hourlyWage?: number | null;
    approvalNumber?: string | null;
    remarks?: string | null;
  }>;
  adminRecord: {
    taxWithholdingCategory?: string | null;
    webSalaryBookEnabled?: boolean | null;
    employmentInsurance?: string | null;
    employmentInsuranceCardSubmitted?: string | null;
    employmentInsuranceNumber?: string | null;
    socialInsurance?: string | null;
    pensionBookSubmitted?: string | null;
    healthInsuranceCardSubmitted?: string | null;
    healthInsuranceCardType?: string | null;
    healthInsuranceCategory?: string | null;
    pensionCategory?: string | null;
    basicPensionNumber?: string | null;
    pensionFundCategory?: string | null;
    baseSalary?: number | null;
    commutingExpenseCategory?: string | null;
    commutingExpensePaymentMethod?: string | null;
    dailyPaymentAmount?: number | null;
    submittedToAdminOn?: string | null;
    returnedToEmployee?: string | null;
    expirationNoticeIssued?: string | null;
    resignationLetterSubmitted?: string | null;
    returnHealthInsuranceCard?: string | null;
    returnSecurityCard?: string | null;
    notes?: string | null;
  } | null;
};

type WorkConditionRow = {
  id: string;
  employee_id: string;
  effective_from: Date | string | null;
  effective_to: Date | string | null;
  work_days_type: string;
  work_days_count: number;
  work_days_count_note: string | null;
  paid_leave_base_date: Date | string | null;
  working_hours_jsonb: unknown;
  break_hours_jsonb: unknown;
  work_locations_jsonb: unknown;
  transportation_routes_jsonb: unknown;
};

export async function fetchEmployeeDetail(
  employeeId: string,
  currentUser?: CurrentUser | null,
): Promise<EmployeeDetail> {
  const [employee] = (await db`
    SELECT
      id,
      employee_number as "employeeNumber",
      branch_number as "branchNumber",
      name,
      name_kana as "nameKana",
      sticker_item as "stickerItem",
      gender,
      birth_date as "birthDate",
      nationality,
      hired_at as "hiredAt",
      rehired_at as "rehiredAt",
      retired_at as "retiredAt",
      employment_type as "employmentType",
      employment_status as "employmentStatus",
      department_code as "departmentCode",
      my_number as "myNumber",
      site_code as "siteCode",
      rehire_count as "rehireCount",
      original_hire_date as "originalHireDate",
      current_hire_date as "currentHireDate",
      updated_at as "updatedAt"
    FROM employees
    WHERE id = ${employeeId}
  `) as Array<{
    id: string;
    employeeNumber: string;
    branchNumber: number;
    name: string;
    nameKana: string;
    stickerItem: string | null;
    gender: string;
    birthDate: Date | string | null;
    nationality: string | null;
    hiredAt: Date | string | null;
    rehiredAt: Date | string | null;
    retiredAt: Date | string | null;
    employmentType: string;
    employmentStatus: string;
    departmentCode: string;
    myNumber: string | null;
    siteCode: string | null;
    rehireCount: number;
    originalHireDate: Date | string | null;
    currentHireDate: Date | string | null;
    updatedAt: Date | string | null;
  } | undefined>;

  // 住所・連絡先情報を取得
  const [contact] = (await db`
    SELECT
      postal_code as "postalCode",
      address1,
      address2,
      address1_kana as "address1Kana",
      address2_kana as "address2Kana",
      phone1,
      email1,
      resident_address_same as "residentAddressSame",
      resident_postal_code as "residentPostalCode",
      resident_address1 as "residentAddress1",
      resident_address2 as "residentAddress2",
      resident_address1_kana as "residentAddress1Kana",
      resident_address2_kana as "residentAddress2Kana"
    FROM employee_contacts
    WHERE employee_id = ${employeeId}
    LIMIT 1
  `) as Array<{
    postalCode: string | null;
    address1: string | null;
    address2: string | null;
    address1Kana: string | null;
    address2Kana: string | null;
    phone1: string | null;
    email1: string | null;
    residentAddressSame: boolean | null;
    residentPostalCode: string | null;
    residentAddress1: string | null;
    residentAddress2: string | null;
    residentAddress1Kana: string | null;
    residentAddress2Kana: string | null;
  }>;

  // 振込口座情報を取得
  const bankAccounts = (await db`
    SELECT
      id,
      payment_priority as "paymentPriority",
      handling_category as "handlingCategory",
      payment_category as "paymentCategory",
      bank_code as "bankCode",
      bank_name as "bankName",
      branch_code as "branchCode",
      branch_name as "branchName",
      deposit_type as "depositType",
      account_number as "accountNumber",
      account_holder_name as "accountHolderName",
      is_active as "isActive"
    FROM employee_bank_accounts
    WHERE employee_id = ${employeeId}
    ORDER BY payment_priority ASC
  `) as Array<{
    id: string;
    paymentPriority: number;
    handlingCategory: string | null;
    paymentCategory: string | null;
    bankCode: string | null;
    bankName: string | null;
    branchCode: string | null;
    branchName: string | null;
    depositType: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    isActive: boolean;
  }>;

  const workConditions = await db<WorkConditionRow[]>`
    SELECT * FROM work_conditions
    WHERE employee_id = ${employeeId}
    ORDER BY effective_from DESC
    LIMIT 5
  `;

  const workConditionDetails = workConditions.map((condition) => ({
    id: condition.id,
    effectiveFrom: toDateString(condition.effective_from),
    effectiveTo: toDateString(condition.effective_to),
    workDaysType: condition.work_days_type,
    workDaysCount: condition.work_days_count,
    workDaysCountNote: condition.work_days_count_note,
    paidLeaveBaseDate: toDateString(condition.paid_leave_base_date),
    workingHours: Array.isArray(condition.working_hours_jsonb)
      ? (condition.working_hours_jsonb as Array<{ start_time?: string; end_time?: string }>).map(
          (slot) => ({ start: slot.start_time ?? "", end: slot.end_time ?? "" }),
        )
      : [],
    breakHours: Array.isArray(condition.break_hours_jsonb)
      ? (condition.break_hours_jsonb as Array<{ start_time?: string; end_time?: string }>).map(
          (slot) => ({ start: slot.start_time ?? "", end: slot.end_time ?? "" }),
        )
      : [],
    workLocations: Array.isArray(condition.work_locations_jsonb)
      ? (
          condition.work_locations_jsonb as Array<{
            location?: string;
            company_name?: string;
            office_name?: string;
            address?: string;
            phone_number?: string;
          }>
        ).map((location) => ({
          location: location.location ?? "",
          companyName: location.company_name ?? "",
          officeName: location.office_name ?? "",
          address: location.address ?? "",
          phoneNumber: location.phone_number ?? "",
        }))
      : [],
    transportationRoutes: Array.isArray(condition.transportation_routes_jsonb)
      ? (condition.transportation_routes_jsonb as Array<{
          route?: string;
          usage_period?: string;
          transportation_name?: string;
          round_trip_amount?: number;
          monthly_pass_amount?: number;
          max_amount?: number;
          nearest_station?: string;
        }>).map((route) => ({
          route: route.route ?? "",
          usagePeriod: route.usage_period ?? "",
          transportationName: route.transportation_name ?? "",
          roundTripAmount: Number(route.round_trip_amount ?? 0),
          monthlyPassAmount: route.monthly_pass_amount ? Number(route.monthly_pass_amount) : null,
          maxAmount: route.max_amount ? Number(route.max_amount) : null,
          nearestStation: route.nearest_station ?? undefined,
        }))
      : [],
  }));

  const contracts = (await db`
    SELECT
      id,
      contract_type as "contractType",
      contract_start_date as "contractStartDate",
      contract_end_date as "contractEndDate",
      is_renewable as "isRenewable",
      employment_expiry_scheduled_date as "employmentExpiryScheduledDate",
      employment_expiry_date as "employmentExpiryDate",
      hourly_wage as "hourlyWage",
      hourly_wage_note as "hourlyWageNote",
      overtime_hourly_wage as "overtimeHourlyWage",
      job_description as "jobDescription",
      paid_leave_clause as "paidLeaveClause",
      status,
      wage_type as "wageType",
      sub_leader_allowance_amount as "subLeaderAllowanceAmount",
      perfect_attendance_allowance_eligible as "perfectAttendanceAllowanceEligible",
      job_description_change_scope as "jobDescriptionChangeScope",
      work_location_change_scope as "workLocationChangeScope",
      overtime_work as "overtimeWork",
      holiday_work as "holidayWork",
      paid_leave_days as "paidLeaveDays",
      paid_leave_base_date_type as "paidLeaveBaseDateType",
      paid_leave_base_date as "paidLeaveBaseDate",
      disability_leave_frequency as "disabilityLeaveFrequency",
      commuting_allowance_max as "commutingAllowanceMax",
      retirement_age as "retirementAge",
      retirement_date as "retirementDate",
      client_holiday_follow as "clientHolidayFollow",
      holidays_note as "holidaysNote",
      working_hours_note as "workingHoursNote",
      piecework_shift_pattern as "pieceworkShiftPattern",
      bonus_clause as "bonusClause",
      employment_insurance_enrolled as "employmentInsuranceEnrolled",
      health_insurance_enrolled as "healthInsuranceEnrolled",
      pension_enrolled as "pensionEnrolled",
      pension_fund_enrolled as "pensionFundEnrolled",
      eligibility_cert_required as "eligibilityCertRequired",
      updated_at as "updatedAt",
      CASE
        WHEN employment_expiry_scheduled_date IS NULL THEN false
        WHEN employment_expiry_scheduled_date < CURRENT_DATE THEN true
        ELSE false
      END as "needsUpdate"
    FROM contracts
    WHERE employee_id = ${employeeId}
    ORDER BY contract_start_date DESC
  `) as Array<{
    id: string;
    contractType: string;
    contractStartDate: Date | string | null;
    contractEndDate: Date | string | null;
    isRenewable: boolean;
    employmentExpiryScheduledDate: Date | string | null;
    employmentExpiryDate: Date | string | null;
    hourlyWage: number;
    hourlyWageNote: string | null;
    overtimeHourlyWage: number | null;
    jobDescription: string | null;
    paidLeaveClause: string | null;
    status: string;
    wageType: string | null;
    subLeaderAllowanceAmount: number | null;
    perfectAttendanceAllowanceEligible: boolean | null;
    jobDescriptionChangeScope: string | null;
    workLocationChangeScope: string | null;
    overtimeWork: boolean | null;
    holidayWork: boolean | null;
    paidLeaveDays: number | null;
    paidLeaveBaseDateType: string | null;
    paidLeaveBaseDate: Date | string | null;
    disabilityLeaveFrequency: string | null;
    commutingAllowanceMax: number | null;
    retirementAge: number | null;
    retirementDate: Date | string | null;
    clientHolidayFollow: boolean | null;
    holidaysNote: string | null;
    workingHoursNote: string | null;
    pieceworkShiftPattern: string | null;
    bonusClause: string | null;
    employmentInsuranceEnrolled: boolean | null;
    healthInsuranceEnrolled: boolean | null;
    pensionEnrolled: boolean | null;
    pensionFundEnrolled: boolean | null;
    eligibilityCertRequired: boolean | null;
    updatedAt: Date | string | null;
    needsUpdate: boolean;
  }>;

  const employmentHistory = (await db`
    SELECT
      id,
      contract_id as "contractId",
      event_type as "eventType",
      effective_date as "effectiveDate",
      department_code as "departmentCode",
      grade,
      hourly_wage as "hourlyWage",
      approval_number as "approvalNumber",
      remarks
    FROM employment_history
    WHERE employee_id = ${employeeId}
    ORDER BY effective_date DESC
  `) as Array<{
    id: string;
    contractId: string | null;
    eventType: string;
    effectiveDate: Date | string | null;
    departmentCode: string | null;
    grade: string | null;
    hourlyWage: number | null;
    approvalNumber: string | null;
    remarks: string | null;
  }>;

  const [adminRecord] = (await db`
    SELECT
      tax_withholding_category,
      web_salary_book_enabled,
      employment_insurance,
      employment_insurance_card_submitted,
      employment_insurance_number,
      social_insurance,
      pension_book_submitted,
      health_insurance_card_submitted,
      health_insurance_card_type,
      health_insurance_category,
      pension_category,
      basic_pension_number,
      pension_fund_category,
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
      notes
    FROM employee_admin_records
    WHERE employee_id = ${employeeId}
    LIMIT 1
  `) as Array<{
    tax_withholding_category: string | null;
    web_salary_book_enabled: boolean | null;
    employment_insurance: string | null;
    employment_insurance_card_submitted: string | null;
    employment_insurance_number: string | null;
    social_insurance: string | null;
    pension_book_submitted: string | null;
    health_insurance_card_submitted: string | null;
    health_insurance_card_type: string | null;
    health_insurance_category: string | null;
    pension_category: string | null;
    basic_pension_number: string | null;
    pension_fund_category: string | null;
    base_salary: number | null;
    commuting_expense_category: string | null;
    commuting_expense_payment_method: string | null;
    daily_payment_amount: number | null;
    submitted_to_admin_on: Date | string | null;
    returned_to_employee: string | null;
    expiration_notice_issued: string | null;
    resignation_letter_submitted: string | null;
    return_health_insurance_card: string | null;
    return_security_card: string | null;
    notes: string | null;
  }>;

  // RBAC列レベル制御
  const showMyNumber = currentUser ? canAccessMyNumber(currentUser.role) : true;
  const showHourlyWage = currentUser ? canAccessHourlyWage(currentUser.role) : true;

  return {
    employee: employee
      ? {
          ...employee,
          stickerItem: employee.stickerItem ?? undefined,
          birthDate: toDateString(employee.birthDate as unknown as Date),
          nationality: employee.nationality ?? undefined,
          hiredAt: toDateString(employee.hiredAt as unknown as Date),
          rehiredAt: toDateString(employee.rehiredAt as unknown as Date),
          retiredAt: toDateString(employee.retiredAt as unknown as Date),
          // 列レベル制御: HR_MANAGER以上のみmyNumberを閲覧可能
          myNumber: showMyNumber ? (employee.myNumber ?? undefined) : undefined,
          siteCode: employee.siteCode ?? undefined,
          rehireCount: employee.rehireCount ?? 0,
          originalHireDate: toDateString(employee.originalHireDate as unknown as Date),
          currentHireDate: toDateString(employee.currentHireDate as unknown as Date),
          updatedAt: toDateTimeString(employee.updatedAt as unknown as Date),
        }
      : null,
    contact: contact
      ? {
          postalCode: contact.postalCode ?? undefined,
          address1: contact.address1 ?? undefined,
          address2: contact.address2 ?? undefined,
          address1Kana: contact.address1Kana ?? undefined,
          address2Kana: contact.address2Kana ?? undefined,
          phone1: contact.phone1 ?? undefined,
          email1: contact.email1 ?? undefined,
          residentAddressSame: contact.residentAddressSame ?? true,
          residentPostalCode: contact.residentPostalCode ?? undefined,
          residentAddress1: contact.residentAddress1 ?? undefined,
          residentAddress2: contact.residentAddress2 ?? undefined,
          residentAddress1Kana: contact.residentAddress1Kana ?? undefined,
          residentAddress2Kana: contact.residentAddress2Kana ?? undefined,
        }
      : null,
    bankAccounts: bankAccounts.map((account) => ({
      id: account.id,
      paymentPriority: account.paymentPriority,
      handlingCategory: account.handlingCategory ?? undefined,
      paymentCategory: account.paymentCategory ?? undefined,
      bankCode: account.bankCode ?? undefined,
      bankName: account.bankName ?? undefined,
      branchCode: account.branchCode ?? undefined,
      branchName: account.branchName ?? undefined,
      depositType: account.depositType ?? undefined,
      accountNumber: account.accountNumber ?? undefined,
      accountHolderName: account.accountHolderName ?? undefined,
      isActive: Boolean(account.isActive),
    })),
    workConditions: workConditionDetails,
    contracts: contracts.map((contract) => ({
      id: contract.id,
      contractType: contract.contractType,
      contractStartDate: toDateString(contract.contractStartDate as unknown as Date),
      contractEndDate: toDateString(contract.contractEndDate as unknown as Date),
      isRenewable: Boolean(contract.isRenewable),
      employmentExpiryScheduledDate: toDateString(
        contract.employmentExpiryScheduledDate as unknown as Date,
      ),
      employmentExpiryDate: toDateString(contract.employmentExpiryDate as unknown as Date),
      needsUpdate: Boolean(contract.needsUpdate),
      // 列レベル制御: FIELD_MANAGER以上のみ時給を閲覧可能
      hourlyWage: showHourlyWage ? Number(contract.hourlyWage ?? 0) : 0,
      hourlyWageNote: showHourlyWage ? (contract.hourlyWageNote ?? undefined) : undefined,
      overtimeHourlyWage: showHourlyWage && contract.overtimeHourlyWage
        ? Number(contract.overtimeHourlyWage)
        : null,
      jobDescription: contract.jobDescription ?? undefined,
      paidLeaveClause: contract.paidLeaveClause ?? undefined,
      status: contract.status,
      wageType: contract.wageType ?? undefined,
      subLeaderAllowanceAmount: showHourlyWage && contract.subLeaderAllowanceAmount ? Number(contract.subLeaderAllowanceAmount) : null,
      perfectAttendanceAllowanceEligible: Boolean(contract.perfectAttendanceAllowanceEligible),
      jobDescriptionChangeScope: contract.jobDescriptionChangeScope ?? undefined,
      workLocationChangeScope: contract.workLocationChangeScope ?? undefined,
      overtimeWork: contract.overtimeWork ?? true,
      holidayWork: contract.holidayWork ?? true,
      paidLeaveDays: contract.paidLeaveDays ?? null,
      paidLeaveBaseDateType: contract.paidLeaveBaseDateType ?? undefined,
      paidLeaveBaseDate: toDateString(contract.paidLeaveBaseDate as unknown as Date),
      disabilityLeaveFrequency: contract.disabilityLeaveFrequency ?? undefined,
      commutingAllowanceMax: contract.commutingAllowanceMax ? Number(contract.commutingAllowanceMax) : null,
      retirementAge: contract.retirementAge ?? null,
      retirementDate: toDateString(contract.retirementDate as unknown as Date),
      clientHolidayFollow: Boolean(contract.clientHolidayFollow),
      holidaysNote: contract.holidaysNote ?? undefined,
      workingHoursNote: contract.workingHoursNote ?? undefined,
      pieceworkShiftPattern: contract.pieceworkShiftPattern ?? undefined,
      bonusClause: contract.bonusClause ?? undefined,
      employmentInsuranceEnrolled: Boolean(contract.employmentInsuranceEnrolled),
      healthInsuranceEnrolled: Boolean(contract.healthInsuranceEnrolled),
      pensionEnrolled: Boolean(contract.pensionEnrolled),
      pensionFundEnrolled: Boolean(contract.pensionFundEnrolled),
      eligibilityCertRequired: Boolean(contract.eligibilityCertRequired),
      updatedAt: toDateTimeString(contract.updatedAt as unknown as Date),
    })),
    employmentHistory: employmentHistory.map((history) => ({
      id: history.id,
      contractId: history.contractId ?? undefined,
      eventType: history.eventType,
      effectiveDate: toDateString(history.effectiveDate as unknown as Date),
      departmentCode: history.departmentCode ?? undefined,
      grade: history.grade ?? undefined,
      hourlyWage: showHourlyWage && history.hourlyWage ? Number(history.hourlyWage) : null,
      approvalNumber: history.approvalNumber ?? undefined,
      remarks: history.remarks ?? undefined,
    })),
    adminRecord: adminRecord
      ? {
          taxWithholdingCategory: adminRecord.tax_withholding_category,
          webSalaryBookEnabled: adminRecord.web_salary_book_enabled,
          employmentInsurance: adminRecord.employment_insurance,
          employmentInsuranceCardSubmitted: adminRecord.employment_insurance_card_submitted,
          employmentInsuranceNumber: adminRecord.employment_insurance_number,
          socialInsurance: adminRecord.social_insurance,
          pensionBookSubmitted: adminRecord.pension_book_submitted,
          healthInsuranceCardSubmitted: adminRecord.health_insurance_card_submitted,
          healthInsuranceCardType: adminRecord.health_insurance_card_type,
          healthInsuranceCategory: adminRecord.health_insurance_category,
          pensionCategory: adminRecord.pension_category,
          basicPensionNumber: adminRecord.basic_pension_number,
          pensionFundCategory: adminRecord.pension_fund_category,
          baseSalary: adminRecord.base_salary ? Number(adminRecord.base_salary) : null,
          commutingExpenseCategory: adminRecord.commuting_expense_category,
          commutingExpensePaymentMethod: adminRecord.commuting_expense_payment_method,
          dailyPaymentAmount: adminRecord.daily_payment_amount
            ? Number(adminRecord.daily_payment_amount)
            : null,
          submittedToAdminOn: toDateString(adminRecord.submitted_to_admin_on as unknown as Date),
          returnedToEmployee: adminRecord.returned_to_employee,
          expirationNoticeIssued: adminRecord.expiration_notice_issued,
          resignationLetterSubmitted: adminRecord.resignation_letter_submitted,
          returnHealthInsuranceCard: adminRecord.return_health_insurance_card,
          returnSecurityCard: adminRecord.return_security_card,
          notes: adminRecord.notes,
        }
      : null,
  };
}
