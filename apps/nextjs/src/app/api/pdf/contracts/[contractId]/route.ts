import { NextResponse } from "next/server";

import {
  createFormattedContractPdf,
  createFormattedPledgePdf,
} from "@/server/pdf/documents";
import { fetchContractDocumentData } from "@/server/queries/contracts";

export async function GET(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  try {
    const [{ contractId }, searchParams] = await Promise.all([
      params,
      Promise.resolve(new URL(request.url).searchParams),
    ]);

    const type = searchParams.get("type") === "pledge" ? "pledge" : "contract";
    const data = await fetchContractDocumentData(contractId);

    if (!data) {
      return NextResponse.json({ message: "契約が見つかりません" }, { status: 404 });
    }

    const pdfBuffer = type === "pledge"
      ? createFormattedPledgePdf(data)
      : createFormattedContractPdf(data);
    const filename = type === "pledge"
      ? `誓約書_${data.employee.employeeNumber}_${data.employee.name}.pdf`
      : `雇用契約書_${data.employee.employeeNumber}_${data.employee.name}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("failed to render pdf", error);
    return NextResponse.json({ message: "PDFの生成に失敗しました" }, { status: 500 });
  }
}
