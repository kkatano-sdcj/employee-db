import { Buffer } from "node:buffer";

const PAGE_WIDTH = 612; // 8.5in
const PAGE_HEIGHT = 792; // 11in
const MARGIN = 50;
const LINE_HEIGHT = 18;
const FONT_SIZE = 12;
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

const number = (value: number) => Number(value.toFixed(4));

const drawTextLine = (text: string, x: number, y: number) => {
  const encoded = encodePdfString(text);
  return `BT ${PDF_FONT_NAME} ${FONT_SIZE} Tf 1 0 0 1 ${number(x)} ${number(y)} Tm ${encoded} Tj ET\n`;
};

const PAGE_LINES = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT);

const chunkLines = (lines: string[]) => {
  if (lines.length === 0) {
    return [[" "]];
  }
  const result: string[][] = [];
  for (let i = 0; i < lines.length; i += PAGE_LINES) {
    result.push(lines.slice(i, i + PAGE_LINES));
  }
  return result;
};

const createPageContent = (lines: string[]) => {
  let content = "q 0 0 0 rg\n";
  lines.forEach((line, index) => {
    const baselineY = PAGE_HEIGHT - MARGIN - index * LINE_HEIGHT - FONT_SIZE;
    content += drawTextLine(line, MARGIN, baselineY);
  });
  content += "Q";
  return content;
};

export type PdfSection = { heading?: string; lines: string[] };

export const buildPdfDocument = (title: string, sections: PdfSection[]) => {
  const lines: string[] = [];
  sections.forEach((section, index) => {
    if (section.heading) {
      lines.push(section.heading);
    }
    lines.push(...section.lines);
    if (index < sections.length - 1) {
      lines.push(" ");
    }
  });

  const pageChunks = chunkLines(lines);
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

  pageChunks.forEach((chunk) => {
    const content = createPageContent(chunk);
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
