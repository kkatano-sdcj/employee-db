#!/usr/bin/env tsx
/**
 * ユーザーロール更新スクリプト
 * 指定されたメールアドレスのユーザーにロールを割り当てます
 */

import { Pool } from "pg";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

// 環境変数の読み込み（env.tsと同じ方法）
const candidateEnvPaths = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "..", ".env"),
  path.join(process.cwd(), "..", "..", ".env"),
];

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
    console.log(`環境変数を読み込みました: ${envPath}`);
  }
}

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL環境変数が設定されていません");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

async function updateUserRoles() {
  const client = await pool.connect();

  try {
    console.log("ユーザーロールの更新を開始します...\n");

    // ロールの更新
    const updates = [
      {
        email: "system_admin@example.com",
        role: "SYSTEM_ADMIN",
      },
      {
        email: "user@example.com",
        role: "FIELD_MANAGER",
      },
      {
        email: "hrmanager@example.com",
        role: "HR_MANAGER",
      },
      {
        email: "admin@example.com",
        role: "ADMIN",
      },
    ];

    for (const update of updates) {
      const result = await client.query(
        `UPDATE public."user" SET role = $1 WHERE email = $2`,
        [update.role, update.email]
      );

      if (result.rowCount === 0) {
        console.warn(
          `⚠️  警告: ${update.email} のユーザーが見つかりませんでした`
        );
      } else {
        console.log(`✅ ${update.email} → ${update.role}`);
      }
    }

    // 更新結果の確認
    console.log("\n更新結果の確認:\n");
    const result = await client.query(
      `SELECT 
        email,
        role,
        "departmentCode",
        name,
        "emailVerified",
        "createdAt"
      FROM public."user"
      WHERE email IN ($1, $2, $3, $4)
      ORDER BY email`,
      [
        "system_admin@example.com",
        "user@example.com",
        "hrmanager@example.com",
        "admin@example.com",
      ]
    );

    if (result.rows.length === 0) {
      console.log("該当するユーザーが見つかりませんでした。");
    } else {
      console.table(result.rows);
    }

    console.log("\n✅ ユーザーロールの更新が完了しました。");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateUserRoles();

