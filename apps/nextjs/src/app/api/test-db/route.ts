import { NextResponse } from "next/server";
import { Pool } from "pg";
import { env } from "@/env";

export async function GET() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test database connection
    const client = await pool.connect();

    // Test query to user table
    const userResult = await client.query(
      'SELECT id, email, name FROM public."user" LIMIT 1'
    );

    // Test query to account table
    const accountResult = await client.query(
      'SELECT "userId", "accountId", "providerId" FROM public.account LIMIT 1'
    );

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      database: "connected",
      user: userResult.rows[0] || null,
      account: accountResult.rows[0] || null,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
