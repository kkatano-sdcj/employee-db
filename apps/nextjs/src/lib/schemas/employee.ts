import { z } from "zod";

export const timeRangeSchema = z.object({
  start: z.string().min(1, "開始時刻を入力してください"),
  end: z.string().min(1, "終了時刻を入力してください"),
});

/** 通勤費1ルート（JSONB transportation_routes_jsonb と対応） */
export const transportationRouteSchema = z.object({
  /** 経路１ */
  route: z.string().optional(),
  /** 利用期間 */
  usagePeriod: z.string().optional(),
  /** 交通機関名 */
  transportationName: z.string().optional(),
  /** 金額（往復）１ */
  roundTripAmount: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? 0 : value),
    z.coerce.number({ invalid_type_error: "往復金額を入力してください" }).nonnegative("0以上で入力してください"),
  ),
  /** 金額（１か月定期）１ */
  monthlyPassAmount: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().nonnegative().optional(),
    )
    .optional(),
  maxAmount: z
    .preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().nonnegative().optional(),
    )
    .optional(),
  nearestStation: z.string().optional(),
});

/** 就業の場所1件（JSONB work_locations_jsonb と対応） */
export const workLocationSchema = z.object({
  companyName: z.string().optional(),
  officeName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  /** 後方互換用の単一勤務地 */
  location: z.string().optional(),
});

// コンテキストとモードに応じたバリデーションスキーマファクトリー
export const createEmployeeFormSchema = (
  _mode: "create" | "edit" = "create",
  context: "employee-management" | "contract-management" | "all" = "all",
) => {
  const showWork = context === "contract-management" || context === "all";
  const showContract = context === "contract-management" || context === "all";
  const showBasic = context === "employee-management" || context === "all";
  /** 従業員登録・管理画面のみ（勤務条件セクションなしで通勤費を表示） */
  const showCommutingBasic = context === "employee-management";

  const workLocationsSchema = showWork
    ? z
        .array(workLocationSchema)
        .min(1, "就業の場所を1件以上入力してください")
        .superRefine((arr, ctx) => {
          arr.forEach((loc, i) => {
            const hasFour =
              !!loc.companyName?.trim() &&
              !!loc.officeName?.trim() &&
              !!loc.address?.trim() &&
              !!loc.phoneNumber?.trim();
            const legacyOnly = !!loc.location?.trim() && !loc.companyName?.trim();
            if (!hasFour && !legacyOnly) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "会社名・事業所名・住所・電話番号を入力するか、従来の勤務地を入力してください",
                path: [i],
              });
            }
          });
        })
    : z.array(workLocationSchema);

  const transportationRoutesSchemaContract = z
    .array(transportationRouteSchema)
    .min(1, "交通費ルートを1件以上入力してください")
    .superRefine((arr, ctx) => {
      arr.forEach((r, i) => {
        if (!r.route?.trim() && !r.transportationName?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "経路１または交通機関名のいずれかを入力してください",
            path: [i, "route"],
          });
        }
      });
    });

  const transportationRoutesSchemaBasic = z.array(transportationRouteSchema);

  return z.object({
    contractNumber: showContract
      ? z.string().min(1, "契約番号を入力してください")
      : z.string(),
    employeeNumber: showBasic
      ? z.string().min(1, "社員コードを入力してください")
      : z.string(),
    name: showBasic
      ? z.string().min(1, "氏名を入力してください")
      : z.string(),
    nameKana: showBasic
      ? z.string().min(1, "氏名フリガナを入力してください")
      : z.string(),
    stickerItem: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    birthDate: showBasic
      ? z.string().min(1, "生年月日を入力してください")
      : z.string(),
    nationality: z.string().optional(),
    hiredAt: showBasic
      ? z.string().min(1, "入社日を入力してください")
      : z.string(),
    rehiredAt: z.string().optional(),
    retiredAt: z.string().optional(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
    employmentStatus: z.enum(["ACTIVE", "RETIRED", "ON_LEAVE", "STANDBY", "ARCHIVED"]),
    departmentCode: showBasic
      ? z.string().min(1, "部門コードを入力してください")
      : z.string(),
    siteCode: z.string().optional(),
    myNumber: z.string().optional(),
    rehireCount: z.coerce.number().nonnegative().default(0),
    originalHireDate: z.string().optional(),
    currentHireDate: z.string().optional(),
    // 連絡先情報
    contact: z.object({
      postalCode: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      address1Kana: z.string().optional(),
      address2Kana: z.string().optional(),
      phone1: z.string().optional(),
      email1: z.string().optional(),
      residentAddressSame: z.boolean().default(true),
      residentPostalCode: z.string().optional(),
      residentAddress1: z.string().optional(),
      residentAddress2: z.string().optional(),
      residentAddress1Kana: z.string().optional(),
      residentAddress2Kana: z.string().optional(),
    }).optional(),
    // 社会保険・給与関連（入社時登録必須項目）
    adminRecords: z.object({
      healthInsuranceCategory: showBasic
        ? z.string().min(1, "健康保険加入区分を入力してください")
        : z.string(),
      pensionCategory: showBasic
        ? z.string().min(1, "厚生年金加入区分を入力してください")
        : z.string(),
      basicPensionNumber: showBasic
        ? z.string().min(1, "基礎年金番号を入力してください")
        : z.string(),
      pensionFundCategory: showBasic
        ? z.string().min(1, "厚生年金基金加入区分を入力してください")
        : z.string(),
      employmentInsurance: showBasic
        ? z.string().min(1, "雇用保険区分を入力してください")
        : z.string(),
      commutingExpenseCategory: z.string(),
      baseSalary: z
        .preprocess(
          (value) => (value === "" || value === null || value === undefined ? undefined : value),
          z.coerce.number().nonnegative().optional(),
        )
        .optional(),
      commutingExpensePaymentMethod: z.string().optional(),
      dailyPaymentAmount: z
        .preprocess(
          (value) => (value === "" || value === null || value === undefined ? undefined : value),
          z.coerce.number().nonnegative().optional(),
        )
        .optional(),
    }).optional(),
    workDaysType: z.enum(["WEEKLY", "MONTHLY", "SHIFT"]),
    workDaysCount: showWork
      ? z.coerce
          .number({ invalid_type_error: "勤務日数を入力してください" })
          .positive("1以上で入力してください")
      : z.coerce.number().nonnegative(),
    workDaysCountNote: z.string().optional(),
    paidLeaveBaseDate: z.string().optional(),
    workingHours: showWork
      ? z.array(timeRangeSchema).min(1, "勤務時間帯を1件以上入力してください")
      : z.array(timeRangeSchema),
    breakHours: z.array(timeRangeSchema).optional(),
    workLocations: workLocationsSchema,
    transportationRoutes: showWork
      ? transportationRoutesSchemaContract
      : showCommutingBasic
        ? transportationRoutesSchemaBasic
        : z.array(transportationRouteSchema),
    documents: z.object({
      healthInsuranceCardSubmitted: z.string().optional(),
      submittedToAdminOn: z.string().optional(),
      returnedToEmployee: z.string().optional(),
      expirationNoticeIssued: z.string().optional(),
      resignationLetterSubmitted: z.string().optional(),
      returnHealthInsuranceCard: z.string().optional(),
      returnSecurityCard: z.string().optional(),
    }),
    contract: z.object({
      contractType: z.enum(["INDEFINITE", "FIXED_TERM", "REHIRED", "DISABILITY"]),
      contractStartDate: showContract
        ? z.string().min(1, "契約開始日を入力してください")
        : z.string(),
      contractEndDate: z.string().optional(),
      isRenewable: z.boolean().default(true),
      hourlyWage: showContract
        ? z.coerce
            .number({ invalid_type_error: "時給単価を入力してください" })
            .positive("1以上で入力してください")
        : z.coerce
            .number({ invalid_type_error: "時給単価を入力してください" })
            .nonnegative(),
      hourlyWageNote: z.string().optional(),
      overtimeHourlyWage: z
        .preprocess(
          (value) => (value === "" ? undefined : value),
          z.coerce.number().nonnegative().optional(),
        )
        .optional(),
      subLeaderAllowanceAmount: z
        .preprocess(
          (value) => (value === "" || value === null || value === undefined ? undefined : value),
          z.coerce.number().nonnegative().optional(),
        )
        .optional(),
      perfectAttendanceAllowanceEligible: z.boolean().default(false),
      jobDescription: z.string().optional(),
      paidLeaveClause: z.string().optional(),
      approvalNumber: z.string().optional(),
      specialNote: z.string().optional(),
      // spec v2 新規フィールド
      jobDescriptionChangeScope: z.string().optional(),
      workLocationChangeScope: z.string().optional(),
      overtimeWork: z.boolean().default(true),
      holidayWork: z.boolean().default(true),
      paidLeaveDays: z.coerce.number().nonnegative().optional(),
      paidLeaveBaseDateType: z.string().optional(),
      paidLeaveBaseDate: z.string().optional(),
      disabilityLeaveFrequency: z.string().optional(),
      commutingAllowanceMax: z
        .preprocess(
          (value) => (value === "" || value === null || value === undefined ? undefined : value),
          z.coerce.number().nonnegative().optional(),
        )
        .optional(),
      retirementAge: z.coerce.number().nonnegative().optional(),
      retirementDate: z.string().optional(),
      clientHolidayFollow: z.boolean().default(false),
      holidaysNote: z.string().optional(),
      workingHoursNote: z.string().optional(),
      pieceworkShiftPattern: z.string().optional(),
      bonusClause: z.string().optional(),
      employmentInsuranceEnrolled: z.boolean().default(false),
      healthInsuranceEnrolled: z.boolean().default(false),
      pensionEnrolled: z.boolean().default(false),
      pensionFundEnrolled: z.boolean().default(false),
      eligibilityCertRequired: z.boolean().default(false),
    }),
  });
};

// 後方互換性のため、デフォルトでcreateモードのスキーマをエクスポート
export const employeeFormSchema = createEmployeeFormSchema("create");

export type EmployeeFormValues = z.infer<ReturnType<typeof createEmployeeFormSchema>>;

export const defaultEmployeeFormValues: EmployeeFormValues = {
  contractNumber: "",
  employeeNumber: "",
  name: "",
  nameKana: "",
  stickerItem: "",
  gender: "OTHER",
  birthDate: "",
  nationality: "",
  hiredAt: "",
  rehiredAt: "",
  retiredAt: "",
  employmentType: "PART_TIME",
  employmentStatus: "ACTIVE",
  departmentCode: "",
  siteCode: "",
  myNumber: "",
  rehireCount: 0,
  originalHireDate: "",
  currentHireDate: "",
  contact: {
    postalCode: "",
    address1: "",
    address2: "",
    address1Kana: "",
    address2Kana: "",
    phone1: "",
    email1: "",
    residentAddressSame: true,
    residentPostalCode: "",
    residentAddress1: "",
    residentAddress2: "",
    residentAddress1Kana: "",
    residentAddress2Kana: "",
  },
  adminRecords: {
    healthInsuranceCategory: "",
    pensionCategory: "",
    basicPensionNumber: "",
    pensionFundCategory: "",
    employmentInsurance: "",
    commutingExpenseCategory: "",
    baseSalary: undefined,
    commutingExpensePaymentMethod: "",
    dailyPaymentAmount: undefined,
  },
  workDaysType: "WEEKLY",
  workDaysCount: 0,
  workDaysCountNote: "",
  paidLeaveBaseDate: "",
  workingHours: [],
  breakHours: [],
  workLocations: [],
  transportationRoutes: [],
  documents: {
    healthInsuranceCardSubmitted: "",
    submittedToAdminOn: "",
    returnedToEmployee: "",
    expirationNoticeIssued: "",
    resignationLetterSubmitted: "",
    returnHealthInsuranceCard: "",
    returnSecurityCard: "",
  },
  contract: {
    contractType: "FIXED_TERM",
    contractStartDate: "",
    contractEndDate: "",
    isRenewable: true,
    hourlyWage: 0,
    hourlyWageNote: "",
    overtimeHourlyWage: undefined,
    subLeaderAllowanceAmount: undefined,
    perfectAttendanceAllowanceEligible: false,
    jobDescription: "",
    paidLeaveClause: "",
    approvalNumber: "",
    specialNote: "",
    jobDescriptionChangeScope: "会社の定める業務",
    workLocationChangeScope: "会社の定める事業所",
    overtimeWork: true,
    holidayWork: true,
    paidLeaveDays: undefined,
    paidLeaveBaseDateType: "",
    paidLeaveBaseDate: "",
    disabilityLeaveFrequency: "",
    commutingAllowanceMax: 15000,
    retirementAge: undefined,
    retirementDate: "",
    clientHolidayFollow: false,
    holidaysNote: "",
    workingHoursNote: "",
    pieceworkShiftPattern: "",
    bonusClause: "支給する。額については、個人の業務内容、業務の責任の範囲、会社・組織の業績などに基づき、個人ごとに個別に決定する。",
    employmentInsuranceEnrolled: false,
    healthInsuranceEnrolled: false,
    pensionEnrolled: false,
    pensionFundEnrolled: false,
    eligibilityCertRequired: false,
  },
};
