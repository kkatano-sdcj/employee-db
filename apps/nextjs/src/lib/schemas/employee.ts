import { z } from "zod";

export const timeRangeSchema = z.object({
  start: z.string().min(1, "開始時刻を入力してください"),
  end: z.string().min(1, "終了時刻を入力してください"),
});

export const transportationRouteSchema = z.object({
  route: z.string().min(1, "ルート名を入力してください"),
  roundTripAmount: z.coerce
    .number({ invalid_type_error: "往復金額を入力してください" })
    .nonnegative("0以上で入力してください"),
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

// 新規登録時のみ必須にするためのスキーマファクトリー
export const createEmployeeFormSchema = (mode: "create" | "edit" = "create") => {
  const isCreate = mode === "create";
  
  return z.object({
    contractNumber: z.string().min(1, "契約番号を入力してください"),
    employeeNumber: z.string().min(1, "社員コードを入力してください"),
    name: z.string().min(1, "氏名を入力してください"),
    nameKana: z.string().min(1, "氏名フリガナを入力してください"),
    stickerItem: z.string().min(1, "フセン項目を入力してください"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    birthDate: z.string().min(1, "生年月日を入力してください"),
    nationality: z.string().optional(),
    hiredAt: z.string().min(1, "入社日を入力してください"),
    rehiredAt: z.string().optional(),
    retiredAt: z.string().optional(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
    employmentStatus: z.enum(["ACTIVE", "RETIRED", "ON_LEAVE"]),
    departmentCode: z.string().min(1, "所属コードを入力してください"),
    myNumber: z.string().optional(),
    // 連絡先情報
    contact: z.object({
      postalCode: z.string().optional(),
      address1: z.string().optional(),
      address2: z.string().optional(),
      address1Kana: z.string().optional(),
      address2Kana: z.string().optional(),
      phone1: z.string().optional(),
      email1: z.string().optional(),
    }).optional(),
    // 社会保険・給与関連（入社時登録必須項目）
    adminRecords: z.object({
      healthInsuranceCategory: z.string().min(1, "健康保険加入区分を入力してください"),
      pensionCategory: z.string().min(1, "厚生年金加入区分を入力してください"),
      basicPensionNumber: z.string().min(1, "基礎年金番号を入力してください"),
      pensionFundCategory: z.string().min(1, "厚生年金基金加入区分を入力してください"),
      employmentInsurance: z.string().min(1, "雇用保険区分を入力してください"),
      commutingExpenseCategory: z.string().min(1, "通勤費区分を入力してください"),
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
  workDaysCount: z.coerce
    .number({ invalid_type_error: "勤務日数を入力してください" })
    .positive("1以上で入力してください"),
  workDaysCountNote: z.string().optional(),
  paidLeaveBaseDate: z.string().optional(),
  workingHours: z.array(timeRangeSchema).min(1, "勤務時間帯を1件以上入力してください"),
  breakHours: z.array(timeRangeSchema).optional(),
  workLocations: z
    .array(
      z.object({
        location: z.string().min(1, "勤務場所を入力してください"),
      }),
    )
    .min(1, "勤務場所を1件以上入力してください"),
  transportationRoutes: z
    .array(transportationRouteSchema)
    .min(1, "交通費ルートを1件以上入力してください"),
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
    contractType: z.enum(["INDEFINITE", "FIXED_TERM"]),
    contractStartDate: z.string().min(1, "契約開始日を入力してください"),
    contractEndDate: z.string().optional(),
    isRenewable: z.boolean().default(true),
    hourlyWage: isCreate
      ? z.coerce
          .number({ invalid_type_error: "時給単価を入力してください" })
          .positive("1以上で入力してください")
      : z.coerce
          .number({ invalid_type_error: "時給単価を入力してください" })
          .positive("1以上で入力してください"),
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
  myNumber: "",
  contact: {
    postalCode: "",
    address1: "",
    address2: "",
    address1Kana: "",
    address2Kana: "",
    phone1: "",
    email1: "",
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
  workDaysCount: 5,
  workDaysCountNote: "",
  paidLeaveBaseDate: "",
  workingHours: [
    {
      start: "09:00",
      end: "18:00",
    },
  ],
  breakHours: [
    {
      start: "12:00",
      end: "13:00",
    },
  ],
  workLocations: [
    {
      location: "本社オフィス",
    },
  ],
  transportationRoutes: [
    {
      route: "自宅-本社",
      roundTripAmount: 1000,
      monthlyPassAmount: undefined,
      maxAmount: undefined,
      nearestStation: "東京",
    },
  ],
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
    hourlyWage: 1200,
    hourlyWageNote: "",
    overtimeHourlyWage: undefined,
    subLeaderAllowanceAmount: undefined,
    perfectAttendanceAllowanceEligible: false,
    jobDescription: "",
    paidLeaveClause: "",
    approvalNumber: "",
    specialNote: "",
  },
};
