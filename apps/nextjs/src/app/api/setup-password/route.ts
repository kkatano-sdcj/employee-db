import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { env } from "@/env";

// Better-Authと同じbcrypt実装を使用
async function hashPassword(password: string): Promise<string> {
  // Dynamic import to match Better-Auth's implementation
  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes("supabase")
        ? { rejectUnauthorized: false }
        : false,
    });

    const client = await pool.connect();

    try {
      // Hash the password using bcryptjs (same as Better-Auth)
      const hashedPassword = await hashPassword(password);

      // Update the account table
      const result = await client.query(
        `UPDATE public.account
         SET password = $1, "updatedAt" = NOW()
         WHERE "accountId" = $2
         RETURNING "userId", "accountId"`,
        [hashedPassword, email]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Password updated for ${email}`,
        hash_prefix: hashedPassword.substring(0, 20),
      });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Setup password error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
