import {
  buildContractPdf,
  buildPledgePdf,
  type ContractPdfData,
  type PledgePdfData,
} from "./contract-pdf-builder";
import type { ContractDocumentData } from "@/server/queries/contracts";

// 日付フォーマット関数
const formatDateJp = (dateStr?: string | null): string => {
  if (!dateStr) return "　　　　年　　月　　日";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 現在日時をフォーマット
const getCurrentDateTimeJp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
};

// 契約書PDF生成
export const createFormattedContractPdf = (data: ContractDocumentData) => {
  const { employee, contract, primaryWorkCondition, adminRecord } = data;

  // 勤務時間の取得
  const workingHours = primaryWorkCondition?.workingHours[0];
  const breakHours = primaryWorkCondition?.breakHours[0];

  // 社会保険リスト
  const socialInsurance: string[] = ["労災保険"];
  if (adminRecord?.employmentInsurance === "yes" || adminRecord?.employmentInsurance === "true") {
    socialInsurance.push("雇用保険");
  }
  if (adminRecord?.socialInsurance === "yes" || adminRecord?.socialInsurance === "true") {
    socialInsurance.push("健康保険、厚生年金、企業年金基金");
  }

  // 勤務場所
  const workLocation = primaryWorkCondition?.workLocations[0]?.location ?? "システムズ・デザイン株式会社 東京本社";

  // 勤務日
  const workDaysText = primaryWorkCondition
    ? `週${primaryWorkCondition.workDaysCount}日勤務（${primaryWorkCondition.workDaysType}）`
    : "シフト表による";

  const pdfData: ContractPdfData = {
    version: "Ver2025.09.",
    createdAt: getCurrentDateTimeJp(),
    employeeName: employee.name,
    companyInfo: {
      address: "東京都新宿区西新宿二丁目１番１号",
      building: "新宿三井ビルディング 32F",
      companyName: "システムズ・デザイン株式会社 東京本社",
      departmentHead: "事業部長",
    },
    employmentPeriod: {
      startDate: formatDateJp(contract.contractStartDate),
      endDate: formatDateJp(contract.employmentExpiryScheduledDate ?? contract.contractEndDate),
      isRenewable: contract.isRenewable,
      renewalCriteria: contract.isRenewable
        ? [
            "契約期間満了時の業務量",
            "従事している業務の進捗状況",
            "能力、業務成績、勤務態度",
            "会社・組織の業績",
          ]
        : undefined,
      maxEmploymentDate: contract.contractStartDate
        ? (() => {
            const startDate = new Date(contract.contractStartDate);
            startDate.setFullYear(startDate.getFullYear() + 5);
            return formatDateJp(startDate.toISOString().slice(0, 10));
          })()
        : undefined,
    },
    workLocation: {
      initial: workLocation,
      address: "東京都新宿区西新宿二丁目１番１号 新宿三井ビルディング 32F",
      phone: "03-6737-5000",
      changeScope: "会社の定める事業所",
    },
    jobDescription: {
      initial: contract.jobDescription ?? "業務内容については別途指示による",
      changeScope: "会社の定める業務",
    },
    workingHours: {
      startTime: workingHours?.start ?? "午前9時00分",
      endTime: workingHours?.end ?? "午後5時00分",
      breakTime: breakHours ? `${breakHours.start}より${breakHours.end}まで` : "正午より午後1時まで",
    },
    workDays: workDaysText,
    socialInsurance,
    holidays: {
      regular: "原則として、毎週土曜日、日曜日、祝日",
      nonRegular: undefined,
    },
    overtime: {
      hasOvertime: false,
      hasHolidayWork: false,
    },
    paidLeave: {
      days: contract.paidLeaveClause ?? "6",
      baseDate: primaryWorkCondition?.paidLeaveBaseDate
        ? formatDateJp(primaryWorkCondition.paidLeaveBaseDate)
        : "入社後6ヶ月経過日",
    },
    wages: {
      hourlyRate: contract.hourlyWage,
      hasBonus: true,
      hasRaise: false,
    },
    allowances: {
      commuting: "実費交通費（月額15,000円を限度とする）",
      overtimeRate: "実働時間7.5時間超 25%",
      holidayRate: "法定外休日 25% / 法定休日 35%",
      nightRate: "25%",
    },
    paymentSchedule: "当月1日起算当月末日締、翌月15日支払(原則振込)",
    resignation: [
      "自己都合退職　退職する３０日以上前に届けること",
      "解雇の事由及び手続　パートタイマー就業規則第53条による",
      "雇用契約満了",
    ],
    other: {
      contactPerson: "人事部 紺野 史紀",
      contactPhone: "03-6737-5000",
    },
  };

  return buildContractPdf(pdfData);
};

// 誓約書PDF生成
export const createFormattedPledgePdf = (data: ContractDocumentData) => {
  const { employee } = data;

  const pdfData: PledgePdfData = {
    version: "Ver2024.02.",
    createdAt: getCurrentDateTimeJp(),
    docNumber: "(SDPMS-M-07-R03-12)",
    revisionDate: "2024.02.01",
    employeeNumber: employee.employeeNumber,
    employeeName: employee.name,
  };

  return buildPledgePdf(pdfData);
};
