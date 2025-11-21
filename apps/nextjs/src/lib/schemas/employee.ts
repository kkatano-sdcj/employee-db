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

export const employeeFormSchema = z.object({
  contractNumber: z.string().min(1, "契約番号を入力してください"),
  employeeNumber: z.string().min(1, "従業員番号を入力してください"),
  name: z.string().min(1, "氏名を入力してください"),
  nameKana: z.string().min(1, "カナ氏名を入力してください"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  birthDate: z.string().min(1, "生年月日を入力してください"),
  nationality: z.string().optional(),
  hiredAt: z.string().min(1, "入社日を入力してください"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  employmentStatus: z.enum(["ACTIVE", "RETIRED", "ON_LEAVE"]),
  departmentCode: z.string().min(1, "所属コードを入力してください"),
  myNumber: z.string().optional(),
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
    hourlyWage: z.coerce
      .number({ invalid_type_error: "時給を入力してください" })
      .positive("1以上で入力してください"),
    hourlyWageNote: z.string().optional(),
    overtimeHourlyWage: z
      .preprocess(
        (value) => (value === "" ? undefined : value),
        z.coerce.number().nonnegative().optional(),
      )
      .optional(),
    jobDescription: z.string().optional(),
    paidLeaveClause: z.string().optional(),
    approvalNumber: z.string().optional(),
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const defaultEmployeeFormValues: EmployeeFormValues = {
  contractNumber: "",
  employeeNumber: "",
  name: "",
  nameKana: "",
  gender: "OTHER",
  birthDate: "",
  nationality: "",
  hiredAt: "",
  employmentType: "PART_TIME",
  employmentStatus: "ACTIVE",
  departmentCode: "",
  myNumber: "",
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
    jobDescription: "",
    paidLeaveClause: "",
    approvalNumber: "",
  },
};
