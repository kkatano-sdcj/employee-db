import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error) {
    console.error("[Auth API] GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.clone().json().catch(() => ({}));
    console.log("[Auth API] POST Request:", {
      action: body.action,
      email: body.email ? `${body.email.substring(0, 3)}***` : undefined,
    });
    const response = await handler.POST(request);
    console.log("[Auth API] POST Response:", {
      status: response.status,
    });
    return response;
  } catch (error) {
    console.error("[Auth API] POST Error:", error);
    console.error("[Auth API] Error Stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
