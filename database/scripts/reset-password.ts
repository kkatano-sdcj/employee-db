#!/usr/bin/env tsx
/**
 * パスワードリセットスクリプト
 * 指定されたメールアドレスのユーザーのパスワードを強制的に変更します
 */

import { Pool } from "pg";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";

// 環境変数の読み込み
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

async function resetPassword(email: string, newPassword: string) {
  const client = await pool.connect();

  try {
    console.log(`\nパスワードリセットを開始します...`);
    console.log(`対象ユーザー: ${email}`);

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // accountテーブルのパスワードを更新
    // Better-Authはaccountテーブルにパスワードを保存する
    const result = await client.query(
      `
      UPDATE public.account
      SET password = $1
      WHERE "userId" IN (
        SELECT id FROM public."user" WHERE email = $2
      )
      AND "providerId" = 'credential'
      RETURNING id, "userId"
      `,
      [hashedPassword, email]
    );

    if (result.rowCount === 0) {
      console.warn(`⚠️  警告: ${email} のアカウントが見つかりませんでした`);
      
      // userテーブルにユーザーが存在するか確認
      const userResult = await client.query(
        `SELECT id, email FROM public."user" WHERE email = $1`,
        [email]
      );
      
      if (userResult.rows.length === 0) {
        console.error(`❌ エラー: ${email} のユーザーが存在しません`);
      } else {
        console.log(`ユーザーは存在しますが、credentialアカウントが見つかりません`);
        console.log(`ユーザーID: ${userResult.rows[0].id}`);
      }
      return;
    }

    console.log(`\n✅ パスワードを更新しました`);
    console.log(`   ユーザー: ${email}`);
    console.log(`   新しいパスワード: ${newPassword}`);
    console.log(`   アカウントID: ${result.rows[0].id}`);

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// コマンドライン引数からメールアドレスとパスワードを取得
const email = process.argv[2] || "user@example.com";
const newPassword = process.argv[3] || "11111111";

resetPassword(email, newPassword);


