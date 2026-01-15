import { db } from "@/server/db";

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
  } = options;
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
    ${department ? db`AND e.department_code = ${department}` : db``}
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

  return rows.map((row) => ({
    ...row,
    contractStartDate: toDateString(row.contractStartDate as unknown as Date),
    contractEndDate: toDateString(row.contractEndDate as unknown as Date),
    employmentExpiryScheduledDate: toDateString(
      row.employmentExpiryScheduledDate as unknown as Date,
    ),
    updatedAt: toDateTimeString(row.updatedAt as unknown as Date),
    needsContractUpdate: Boolean(row.needsContractUpdate),
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
    workLocations: Array<{ location: string }>;
    transportationRoutes: Array<{
      route: string;
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

export async function fetchEmployeeDetail(employeeId: string): Promise<EmployeeDetail> {
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
      email1
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
      ? (condition.work_locations_jsonb as Array<{ location?: string }>).map((location) => ({
          location: location.location ?? "",
        }))
      : [],
    transportationRoutes: Array.isArray(condition.transportation_routes_jsonb)
      ? (condition.transportation_routes_jsonb as Array<{
          route?: string;
          round_trip_amount?: number;
          monthly_pass_amount?: number;
          max_amount?: number;
          nearest_station?: string;
        }>).map((route) => ({
          route: route.route ?? "",
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
          myNumber: employee.myNumber ?? undefined,
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
      hourlyWage: Number(contract.hourlyWage ?? 0),
      hourlyWageNote: contract.hourlyWageNote ?? undefined,
      overtimeHourlyWage: contract.overtimeHourlyWage
        ? Number(contract.overtimeHourlyWage)
        : null,
      jobDescription: contract.jobDescription ?? undefined,
      paidLeaveClause: contract.paidLeaveClause ?? undefined,
      status: contract.status,
      updatedAt: toDateTimeString(contract.updatedAt as unknown as Date),
    })),
    employmentHistory: employmentHistory.map((history) => ({
      id: history.id,
      contractId: history.contractId ?? undefined,
      eventType: history.eventType,
      effectiveDate: toDateString(history.effectiveDate as unknown as Date),
      departmentCode: history.departmentCode ?? undefined,
      grade: history.grade ?? undefined,
      hourlyWage: history.hourlyWage ? Number(history.hourlyWage) : null,
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
