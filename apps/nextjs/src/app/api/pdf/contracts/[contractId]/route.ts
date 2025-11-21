import { NextResponse } from "next/server";

import { createContractPdf, createPledgePdf } from "@/server/pdf/documents";
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

    const pdfBuffer = type === "pledge" ? createPledgePdf(data) : createContractPdf(data);
    const filename = `${type === "pledge" ? "pledge" : "contract"}-${data.contract.id}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("failed to render pdf", error);
    return NextResponse.json({ message: "PDFの生成に失敗しました" }, { status: 500 });
  }
}
