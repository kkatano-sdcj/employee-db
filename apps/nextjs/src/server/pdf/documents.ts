import { formatCurrency } from "@/lib/formatters";
import { buildPdfDocument, type PdfSection } from "./pdf-builder";
import type { ContractDocumentData } from "@/server/queries/contracts";

const formatDate = (value?: string | null) => value ?? "-";
const formatList = (items?: string[]) => (items && items.length > 0 ? items.join(", ") : "-");
const yesNo = (value?: string | null) => {
  if (!value) return "-";
  const normalized = value.toLowerCase();
  if (["yes", "true", "1", "y"].includes(normalized)) return "加入";
  if (["no", "false", "0", "n"].includes(normalized)) return "未加入";
  return value;
};

const buildContractSections = (data: ContractDocumentData): PdfSection[] => {
  const { employee, contract, primaryWorkCondition, adminRecord } = data;
  const workingHours = primaryWorkCondition?.workingHours.map(
    (slot) => `${slot.start} ~ ${slot.end}`,
  );
  const breakHours = primaryWorkCondition?.breakHours.map(
    (slot) => `${slot.start} ~ ${slot.end}`,
  );
  const transportation = primaryWorkCondition?.transportationRoutes.map((route) => {
    const base = `${route.route} / 往復 ${formatCurrency(route.roundTripAmount)}`;
    const extras = [
      route.monthlyPassAmount ? `定期 ${formatCurrency(route.monthlyPassAmount)}` : undefined,
      route.maxAmount ? `上限 ${formatCurrency(route.maxAmount)}` : undefined,
      route.nearestStation ? `最寄り ${route.nearestStation}` : undefined,
    ].filter(Boolean);
    return [base, ...extras].join(" | ");
  });

  return [
    {
      heading: "契約概要",
      lines: [
        `契約書番号: ${contract.id}`,
        `従業員番号: ${employee.employeeNumber}`,
        `氏名: ${employee.name} 殿`,
        `雇用区分: ${employee.employmentType}`,
        `部署: ${employee.departmentCode}`,
        `契約期間: ${formatDate(contract.contractStartDate)} ~ ${
          contract.employmentExpiryScheduledDate ?? "継続"
        }`,
        `実際の雇用終了日: ${formatDate(contract.employmentExpiryDate)}`,
      ],
    },
    {
      heading: "勤務条件",
      lines: [
        `勤務日数: ${primaryWorkCondition?.workDaysCount ?? "-"} (${primaryWorkCondition?.workDaysType ?? "-"})`,
        `勤務時間: ${formatList(workingHours)}`,
        `休憩時間: ${formatList(breakHours)}`,
        `勤務場所: ${formatList(primaryWorkCondition?.workLocations.map((loc) => loc.location))}`,
        `交通費: ${formatList(transportation)}`,
        `業務内容: ${contract.jobDescription ?? "-"}`,
      ],
    },
    {
      heading: "賃金・手当",
      lines: [
        `時給: ${formatCurrency(contract.hourlyWage)}`,
        `残業時給: ${contract.overtimeHourlyWage ? formatCurrency(contract.overtimeHourlyWage) : "-"}`,
        `有給条項: ${contract.paidLeaveClause ?? "-"}`,
        `給与メモ: ${contract.hourlyWageNote ?? "-"}`,
      ],
    },
    {
      heading: "書類・社会保険",
      lines: [
        `契約書提出日: ${formatDate(adminRecord?.submittedToAdminOn)}`,
        `本人返却: ${adminRecord?.returnedToEmployee ?? "-"}`,
        `満了通知書: ${adminRecord?.expirationNoticeIssued ?? "未発行"}`,
        `退職届: ${adminRecord?.resignationLetterSubmitted ?? "未提出"}`,
        `健康保険証返却: ${adminRecord?.returnHealthInsuranceCard ?? "未返却"}`,
        `セキュリティカード返却: ${adminRecord?.returnSecurityCard ?? "未返却"}`,
        `雇用保険: ${yesNo(adminRecord?.employmentInsurance)}`,
        `社会保険: ${yesNo(adminRecord?.socialInsurance)}`,
      ],
    },
  ];
};

const buildPledgeSections = (data: ContractDocumentData): PdfSection[] => {
  const { employee, contract } = data;
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      heading: "誓約書",
      lines: [
        `作成日: ${today}`,
        `契約番号: ${contract.id}`,
        `従業員番号: ${employee.employeeNumber}`,
        `氏名: ${employee.name}`,
        "私は上記の契約内容を理解し、会社の就業規則ならびに安全衛生規程を遵守することを誓います。",
        "職務上知り得た機密情報を漏洩せず、退職後も同様に取り扱うことを約します。",
        "会社の資産および備品を適切に管理し、指示があれば速やかに返却します。",
      ],
    },
  ];
};

export const createContractPdf = (data: ContractDocumentData) =>
  buildPdfDocument(`雇用契約書_${data.contract.id}`, buildContractSections(data));

export const createPledgePdf = (data: ContractDocumentData) =>
  buildPdfDocument(`誓約書_${data.contract.id}`, buildPledgeSections(data));
