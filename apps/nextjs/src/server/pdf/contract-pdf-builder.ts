import { Buffer } from "node:buffer";

// A4サイズ (595.28 x 841.89 pt)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const FONT_SIZE_TITLE = 16;
const FONT_SIZE_NORMAL = 9;
const FONT_SIZE_SMALL = 7.5;
const LINE_HEIGHT = 13;

// 右揃えテキストの基準位置（テーブルの右端より少し内側に配置）
const RIGHT_ALIGN_X = MARGIN_LEFT + CONTENT_WIDTH - 10;

const PDF_FONT_NAME = "/F1";
const PDF_FONT_BASE = "/HeiseiKakuGo-W5";

const encodePdfString = (value: string) => {
  if (!value) {
    return "()";
  }
  const utf16 = Buffer.alloc((value.length + 1) * 2);
  utf16.writeUInt16BE(0xfeff, 0);
  for (let i = 0; i < value.length; i += 1) {
    utf16.writeUInt16BE(value.charCodeAt(i), 2 + i * 2);
  }
  return `<${utf16.toString("hex").toUpperCase()}>`;
};

const num = (value: number) => Number(value.toFixed(4));

// テキスト描画
const drawText = (text: string, x: number, y: number, fontSize: number = FONT_SIZE_NORMAL) => {
  const encoded = encodePdfString(text);
  return `BT ${PDF_FONT_NAME} ${fontSize} Tf 1 0 0 1 ${num(x)} ${num(y)} Tm ${encoded} Tj ET\n`;
};

// 文字幅を計算（日本語全角文字はフォントサイズとほぼ同じ幅）
const getTextWidth = (text: string, fontSize: number): number => {
  let width = 0;
  for (const char of text) {
    // ASCII文字は半角、それ以外は全角として計算
    if (char.charCodeAt(0) < 128) {
      width += fontSize * 0.5;
    } else {
      width += fontSize; // 日本語全角文字
    }
  }
  return width;
};

// 右寄せテキスト描画
const drawTextRight = (text: string, x: number, y: number, fontSize: number = FONT_SIZE_NORMAL) => {
  const textWidth = getTextWidth(text, fontSize);
  return drawText(text, x - textWidth, y, fontSize);
};

// 中央寄せテキスト描画
const drawTextCenter = (text: string, centerX: number, y: number, fontSize: number = FONT_SIZE_NORMAL) => {
  const textWidth = getTextWidth(text, fontSize);
  return drawText(text, centerX - textWidth / 2, y, fontSize);
};

// テキストを指定幅で折り返す
const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
  // 現在のテキストが収まるかチェック
  if (getTextWidth(text, fontSize) <= maxWidth) {
    return [text];
  }

  const lines: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // 残りのテキストが収まるかチェック
    if (getTextWidth(remaining, fontSize) <= maxWidth) {
      lines.push(remaining);
      break;
    }

    // 収まる文字数を探す
    let breakPoint = 1;
    for (let i = 1; i <= remaining.length; i++) {
      const substring = remaining.substring(0, i);
      if (getTextWidth(substring, fontSize) > maxWidth) {
        breakPoint = Math.max(1, i - 1);
        break;
      }
      breakPoint = i;
    }

    // 句読点や空白で区切る位置を優先
    for (let i = breakPoint; i > Math.max(1, breakPoint - 8); i--) {
      const char = remaining[i - 1];
      if (char === '。' || char === '、' || char === ' ' || char === '　' || char === '）' || char === '」') {
        breakPoint = i;
        break;
      }
    }

    lines.push(remaining.substring(0, breakPoint));
    remaining = remaining.substring(breakPoint);
  }

  return lines;
};

// 矩形描画（塗りつぶし）
const drawRect = (x: number, y: number, width: number, height: number, fill: boolean = false) => {
  if (fill) {
    return `${num(x)} ${num(y)} ${num(width)} ${num(height)} re f\n`;
  }
  return `${num(x)} ${num(y)} ${num(width)} ${num(height)} re S\n`;
};

// 線描画
const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
  return `${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S\n`;
};

// テーブル行の型定義
export type TableRow = {
  header: string;
  content: string[];
  headerWidth?: number;
};

export type ContractPdfData = {
  version: string;
  createdAt: string;
  employeeName: string;
  companyInfo: {
    address: string;
    building: string;
    companyName: string;
    departmentHead: string;
  };
  employmentPeriod: {
    startDate: string;
    endDate: string;
    isRenewable: boolean;
    renewalCriteria?: string[];
    maxEmploymentDate?: string;
  };
  workLocation: {
    initial: string;
    address: string;
    phone: string;
    changeScope: string;
  };
  jobDescription: {
    initial: string;
    changeScope: string;
  };
  workingHours: {
    startTime: string;
    endTime: string;
    breakTime: string;
  };
  workDays: string;
  socialInsurance: string[];
  holidays: {
    regular: string;
    nonRegular?: string;
  };
  overtime: {
    hasOvertime: boolean;
    hasHolidayWork: boolean;
  };
  paidLeave: {
    days: string;
    baseDate: string;
  };
  wages: {
    hourlyRate: number;
    hasBonus: boolean;
    hasRaise: boolean;
  };
  allowances: {
    commuting: string;
    overtimeRate: string;
    holidayRate: string;
    nightRate: string;
  };
  paymentSchedule: string;
  resignation: string[];
  other: {
    contactPerson: string;
    contactPhone: string;
  };
};

export type PledgePdfData = {
  version: string;
  createdAt: string;
  docNumber: string;
  revisionDate: string;
  employeeNumber: string;
  employeeName: string;
};

// 契約書PDF生成
export const buildContractPdf = (data: ContractPdfData): Buffer => {
  const pages: string[] = [];
  let currentPageContent = "";
  let currentY = PAGE_HEIGHT - MARGIN_TOP;

  const newPage = () => {
    if (currentPageContent) {
      pages.push(currentPageContent);
    }
    currentPageContent = "q 0 0 0 rg 0.5 w\n";
    currentY = PAGE_HEIGHT - MARGIN_TOP;
  };

  const checkPageBreak = (requiredHeight: number) => {
    if (currentY - requiredHeight < MARGIN_BOTTOM) {
      newPage();
    }
  };

  newPage();

  // バージョン番号
  currentPageContent += drawTextRight(data.version, RIGHT_ALIGN_X, currentY, FONT_SIZE_SMALL);
  currentY -= LINE_HEIGHT * 2;

  // タイトル（ページ中央に配置）
  const contractTitleText = "雇用契約書";
  const contractTitleWidth = getTextWidth(contractTitleText, FONT_SIZE_TITLE);
  currentPageContent += drawText(contractTitleText, (PAGE_WIDTH - contractTitleWidth) / 2, currentY, FONT_SIZE_TITLE);
  currentY -= LINE_HEIGHT * 2;

  // 日付
  currentPageContent += drawTextRight(data.createdAt, RIGHT_ALIGN_X, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 1.5;

  // 宛名
  currentPageContent += drawText(`${data.employeeName} 殿`, MARGIN_LEFT + 20, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 会社情報
  const companyLines = [
    data.companyInfo.address,
    data.companyInfo.building,
    data.companyInfo.companyName,
    "",
    `${data.companyInfo.departmentHead}　印`,
  ];
  companyLines.forEach((line) => {
    currentPageContent += drawTextRight(line, RIGHT_ALIGN_X, currentY, FONT_SIZE_NORMAL);
    currentY -= LINE_HEIGHT;
  });
  currentY -= LINE_HEIGHT;

  // 導入文
  currentPageContent += drawText("あなたを採用するに当たっての労働条件は、次のとおりです。", MARGIN_LEFT, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 1.5;

  // テーブル描画
  const tableX = MARGIN_LEFT;
  const headerWidth = 75;
  const tableWidth = CONTENT_WIDTH - 10; // テーブル全体の幅（右側に余裕）
  const contentWidth = tableWidth - headerWidth - 10; // コンテンツエリアの幅

  const drawTableRow = (header: string, content: string[], rowHeight: number) => {
    // コンテンツを折り返して実際の行数を計算
    const wrappedContent: string[] = [];
    content.forEach((line) => {
      const wrapped = wrapText(line, contentWidth, FONT_SIZE_SMALL);
      wrappedContent.push(...wrapped);
    });

    // 実際に必要な高さを計算
    const actualHeight = Math.max(rowHeight, wrappedContent.length * LINE_HEIGHT + 10);

    checkPageBreak(actualHeight + 20);

    const rowY = currentY - actualHeight;

    // ヘッダーセル背景
    currentPageContent += "0.95 0.95 0.95 rg\n";
    currentPageContent += drawRect(tableX, rowY, headerWidth, actualHeight, true);
    currentPageContent += "0 0 0 rg\n";

    // 罫線
    currentPageContent += drawRect(tableX, rowY, CONTENT_WIDTH, actualHeight);
    currentPageContent += drawLine(tableX + headerWidth, currentY, tableX + headerWidth, rowY);

    // ヘッダーテキスト
    currentPageContent += drawText(header, tableX + 3, currentY - LINE_HEIGHT, FONT_SIZE_SMALL);

    // コンテンツテキスト
    let contentY = currentY - LINE_HEIGHT;
    wrappedContent.forEach((line) => {
      if (contentY > rowY + 4) {
        currentPageContent += drawText(line, tableX + headerWidth + 4, contentY, FONT_SIZE_SMALL);
        contentY -= LINE_HEIGHT;
      }
    });

    currentY = rowY;
  };

  // 雇用期間
  const periodContent = [
    `期間の定め有り （${data.employmentPeriod.startDate} から ${data.employmentPeriod.endDate} 迄）`,
    `契約更新の有無　${data.employmentPeriod.isRenewable ? "有" : "無"}`,
  ];
  if (data.employmentPeriod.isRenewable && data.employmentPeriod.renewalCriteria) {
    periodContent.push("※契約の更新の判断基準※");
    data.employmentPeriod.renewalCriteria.forEach((criteria) => {
      periodContent.push(`・${criteria}`);
    });
  }
  if (data.employmentPeriod.maxEmploymentDate) {
    periodContent.push(`※有期契約の雇用は最長5年までとする（基準日：${data.employmentPeriod.maxEmploymentDate}）`);
  }
  drawTableRow("雇用期間", periodContent, Math.max(80, periodContent.length * LINE_HEIGHT + 10));

  // 就業の場所
  const locationContent = [
    "（雇い入れ直後）",
    data.workLocation.initial,
    `住所：${data.workLocation.address}`,
    `電話番号：${data.workLocation.phone}`,
    "（変更の範囲）",
    data.workLocation.changeScope,
  ];
  drawTableRow("就業の場所", locationContent, 80);

  // 業務の内容
  const jobContent = [
    "（雇い入れ直後）",
    data.jobDescription.initial,
    "（変更の範囲）",
    data.jobDescription.changeScope,
  ];
  drawTableRow("業務の内容", jobContent, 55);

  // 始業・終業の時刻及び休憩時間
  const workHoursContent = [
    `１．始業・終業時間　（始業）${data.workingHours.startTime}～（終業）${data.workingHours.endTime}`,
    `２．休憩時間　${data.workingHours.breakTime}`,
  ];
  drawTableRow("始業・終業の時刻\n及び休憩時間", workHoursContent, 40);

  // 勤務日
  drawTableRow("勤務日", [data.workDays], 25);

  // 社会保険加入
  const insuranceContent = data.socialInsurance.map((ins, i) => `${i + 1}．${ins}`);
  drawTableRow("社会保険加入", insuranceContent, Math.max(40, insuranceContent.length * LINE_HEIGHT + 10));

  // 休日
  const holidayContent = [`１．定例日　${data.holidays.regular}`];
  if (data.holidays.nonRegular) {
    holidayContent.push(`２．非定例日　${data.holidays.nonRegular}`);
  }
  drawTableRow("休　日", holidayContent, 35);

  // 所定外労働等
  const overtimeContent = [
    `１．所定外労働をさせることが　（ ${data.overtime.hasOvertime ? "有" : "無"} ）`,
    `２．休日労働をさせることが　（ ${data.overtime.hasHolidayWork ? "有" : "無"} ）`,
    "３．３６協定を上限とする",
  ];
  drawTableRow("所定外労働等", overtimeContent, 45);

  // 休暇
  const leaveContent = [
    `年次有給休暇　${data.paidLeave.days}日`,
    `基準日：${data.paidLeave.baseDate}（付与予定日）`,
    "※詳細はパートタイマー就業規則第30条による",
  ];
  drawTableRow("休　暇", leaveContent, 45);

  // ページ2へ
  newPage();

  // バージョン番号（2ページ目）
  currentPageContent += drawTextRight(data.version, RIGHT_ALIGN_X, currentY, FONT_SIZE_SMALL);
  currentY -= LINE_HEIGHT * 1.5;

  // 賃金
  const wagesContent = [
    `１．時間給　1時間に付　¥${data.wages.hourlyRate.toLocaleString()}`,
    "　　但し、日々は1分単位で計算し、月間合計就業時間が１時間に満たない部分は",
    "　　0～14分:0分 15分:15分 16～44分:30分 45分:45分 46～59分：1時間",
    `２．賞与　${data.wages.hasBonus ? "支給する" : "支給しない"}`,
    `３．昇給　${data.wages.hasRaise ? "契約更新時に賃金の変更可能性あり" : "契約期間途中は原則なし"}`,
  ];
  drawTableRow("賃　金", wagesContent, 70);

  // 諸手当
  const allowanceContent = [
    `１．通勤手当　${data.allowances.commuting}`,
    `２．残業手当　割増率　${data.allowances.overtimeRate}`,
    `３．休日手当　割増率　${data.allowances.holidayRate}`,
    `４．深夜手当　割増率　${data.allowances.nightRate}`,
    "５．６０時間超時間外勤務手当＝２５％×６０時間超時間外労働時間（法定休日除く）",
    "６．退職金　退職金は支給しない",
  ];
  drawTableRow("諸手当", allowanceContent, 85);

  // 賃金の支払
  drawTableRow("賃金の支払", [data.paymentSchedule], 25);

  // 退職に関する事項
  const resignContent = data.resignation.map((item, i) => `${i + 1}．${item}`);
  drawTableRow("退職に関する事項", resignContent, 45);

  // その他
  const otherContent = [
    "１．雇用管理の改善等に関する事項にかかる相談窓口",
    `　　${data.other.contactPerson}　連絡先：${data.other.contactPhone}`,
    "２．本契約に関する紛争については、東京地方裁判所を第一審の専属的管轄裁判所とする。",
    "３．本契約締結の証として、本書を書面又は電磁的記録として作成し、",
    "　　雇用者及び雇用契約者が合意の後、記名押印又は電子署名を施し、",
    "　　各自その書面又は電磁的記録を保管する。",
    "",
    "※その他、詳細はパートタイマー就業規則による",
  ];
  drawTableRow("その他", otherContent, 110);

  currentY -= LINE_HEIGHT * 2;

  // 署名欄
  currentPageContent += drawTextRight(`${data.createdAt}`, RIGHT_ALIGN_X, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 1.5;

  currentPageContent += drawText("上記労働条件で契約致します。", MARGIN_LEFT, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 署名欄の基準位置（右端をRIGHT_ALIGN_Xに揃える）
  const signatureStartX = RIGHT_ALIGN_X - 154;

  currentPageContent += drawText("労働者", signatureStartX, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 1.5;

  // 署名欄の下線
  currentPageContent += drawText("氏　名", signatureStartX, currentY, FONT_SIZE_NORMAL);
  currentPageContent += drawLine(signatureStartX + 40, currentY - 2, signatureStartX + 140, currentY - 2);
  currentPageContent += drawText("印", signatureStartX + 145, currentY, FONT_SIZE_NORMAL);

  currentPageContent += "Q";
  pages.push(currentPageContent);

  return buildPdfFromPages("雇用契約書", pages);
};

// 誓約書PDF生成
export const buildPledgePdf = (data: PledgePdfData): Buffer => {
  let content = "q 0 0 0 rg 0.5 w\n";
  let currentY = PAGE_HEIGHT - MARGIN_TOP;
  // 使用可能な幅（右側に余裕を持たせる）
  const availableWidth = CONTENT_WIDTH - 40;
  // 右揃えテキストの基準位置（右側余白を確保）
  const pledgeRightAlignX = MARGIN_LEFT + availableWidth;

  // 折り返し付きテキスト描画
  const drawWrappedText = (text: string, x: number, fontSize: number = FONT_SIZE_NORMAL): void => {
    const maxWidth = availableWidth - (x - MARGIN_LEFT);
    const lines = wrapText(text, maxWidth, fontSize);
    lines.forEach((line, index) => {
      // 2行目以降はインデント
      const lineX = index === 0 ? x : MARGIN_LEFT + 20;
      content += drawText(line, lineX, currentY, fontSize);
      currentY -= LINE_HEIGHT;
    });
  };

  // ヘッダー
  content += drawText(data.docNumber, MARGIN_LEFT, currentY, FONT_SIZE_SMALL);
  content += drawTextRight(`最終改定日：${data.revisionDate}`, pledgeRightAlignX, currentY, FONT_SIZE_SMALL);
  currentY -= LINE_HEIGHT * 3;

  // タイトル（ページ中央に配置）
  const titleText = "誓　約　書";
  const titleWidth = getTextWidth(titleText, FONT_SIZE_TITLE);
  content += drawText(titleText, (PAGE_WIDTH - titleWidth) / 2, currentY, FONT_SIZE_TITLE);
  currentY -= LINE_HEIGHT * 3;

  // 宛先
  content += drawText("システムズ・デザイン株式会社　御中", MARGIN_LEFT, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 導入文
  content += drawText("私は、以下の事項を厳守することを誓約いたします。", MARGIN_LEFT + 10, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 記
  content += drawTextCenter("記", PAGE_WIDTH / 2, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 条項1
  drawWrappedText("１．業務上知り得た、技術および営業に関する機密情報（個人情報注1を含み、以下同じ。）に関して、以下のことを守ります。", MARGIN_LEFT, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 0.3;
  content += drawText("(1) 会社の許可なく所定の場所より持ち出さないこと。", MARGIN_LEFT + 20, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT;
  content += drawText("(2) 会社の許可なく複製しないこと。", MARGIN_LEFT + 20, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT;
  content += drawText("(3) 会社の許可なく目的外の利用をしないこと。", MARGIN_LEFT + 20, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT;
  content += drawText("(4) 会社の許可なく廃棄または残置しないこと。", MARGIN_LEFT + 20, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 1.5;

  // 条項2
  drawWrappedText("２．在職中は法令等を遵守し、また、会社の定める情報セキュリティ関連の各種ルール（情報資産関係規程、「情報セキュリティガイドライン」、「ISMSセキュリティルールブック」等）、個人情報保護規程並びにその他細則に従い、個人情報を含む情報資産の取扱いには細心の注意を払い誠実に業務を遂行いたします。", MARGIN_LEFT, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 0.5;

  // 条項3
  drawWrappedText("３．私が会社を退職した後も、勤務中と同様に、業務上知り得た技術および営業に関する機密情報を会社の許可なく発表、公開、漏洩、利用いたしません。", MARGIN_LEFT, FONT_SIZE_NORMAL);
  drawWrappedText("万が一事件事故が発生した場合は、速やかに会社に報告し、会社の指示に従うとともに調査に全面的に協力いたします。", MARGIN_LEFT + 20, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 0.5;

  // 条項4
  drawWrappedText("４．故意又は過失により、私が原因で機密情報の紛失、漏洩などによる事故が発生し、会社及び第三者に損害を生じさせた場合は、就業規則等会社規則に従いその全部又は一部の賠償を求められたり処罰されても不服を申し立てません。", MARGIN_LEFT, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 日付
  content += drawTextRight(data.createdAt, pledgeRightAlignX, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2;

  // 署名欄
  const signatureX = PAGE_WIDTH / 2 - 30;
  content += drawText("（社員番号）", signatureX, currentY, FONT_SIZE_NORMAL);
  content += drawText(data.employeeNumber, signatureX + 65, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 2.5;

  content += drawText("（氏　　名）", signatureX, currentY, FONT_SIZE_NORMAL);
  content += drawLine(signatureX + 60, currentY - 2, signatureX + 180, currentY - 2);
  currentY -= LINE_HEIGHT * 2;

  // 以上
  content += drawTextRight("以上", pledgeRightAlignX, currentY, FONT_SIZE_NORMAL);
  currentY -= LINE_HEIGHT * 3;

  // 注釈
  content += drawText("注１：「個人情報の保護に関する法律」に定める個人情報をいう。", MARGIN_LEFT, currentY, FONT_SIZE_SMALL);

  // フッター
  content += drawTextRight("システムズ・デザイン株式会社", pledgeRightAlignX, MARGIN_BOTTOM + 10, FONT_SIZE_SMALL);

  content += "Q";

  return buildPdfFromPages("誓約書", [content]);
};

// PDFドキュメント生成
const buildPdfFromPages = (title: string, pageContents: string[]): Buffer => {
  const objects: { body: string }[] = [];
  const addObject = (body = "") => {
    objects.push({ body });
    return objects.length;
  };
  const setObject = (id: number, body: string) => {
    objects[id - 1].body = body;
  };

  const catalogId = addObject();
  const pagesId = addObject();
  const fontDescriptorId = addObject(`<< /Type /FontDescriptor /FontName ${PDF_FONT_BASE} >>`);
  const cidFontId = addObject(
    `<< /Type /Font /Subtype /CIDFontType0 /BaseFont ${PDF_FONT_BASE} /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 0 >> /FontDescriptor ${fontDescriptorId} 0 R /DW 1000 >>`,
  );
  const fontId = addObject(
    `<< /Type /Font /Subtype /Type0 /BaseFont ${PDF_FONT_BASE} /Encoding /UniJIS-UCS2-H /DescendantFonts [${cidFontId} 0 R] >>`,
  );

  const pageIds: number[] = [];
  pageContents.forEach((content) => {
    const contentId = addObject(
      `<< /Length ${Buffer.byteLength(content, "utf-8")} >>\nstream\n${content}\nendstream`,
    );
    const pageId = addObject();
    pageIds.push(pageId);
    setObject(
      pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << ${PDF_FONT_NAME} ${fontId} 0 R >> >> >>`,
    );
  });

  setObject(
    pagesId,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  );

  setObject(
    catalogId,
    `<< /Type /Catalog /Pages ${pagesId} 0 R /ViewerPreferences << /DisplayDocTitle true >> >>`,
  );

  const infoId = addObject(`<< /Title ${encodePdfString(title)} /Producer (employee-db) >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((obj, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf-8"));
    pdf += `${index + 1} 0 obj\n${obj.body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf-8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf-8");
};
