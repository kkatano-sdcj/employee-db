#!/usr/bin/env tsx
/**
 * Supabase接続テストスクリプト
 * 
 * 使用方法:
 *   pnpm tsx apps/nextjs/scripts/test-db-connection.ts
 * 
 * または:
 *   cd apps/nextjs && pnpm tsx scripts/test-db-connection.ts
 */

import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ESM対応の__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
// ルートディレクトリから実行される場合とapps/nextjsから実行される場合の両方に対応
const rootEnvPath = resolve(__dirname, "../../../.env");
const localEnvPath = resolve(__dirname, "../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath });

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

async function testConnection() {
  if (!DATABASE_URL) {
    console.error("❌ エラー: DATABASE_URL または POSTGRES_URL が設定されていません");
    console.log("\n環境変数の設定方法:");
    console.log("  .env ファイルに以下を追加してください:");
    console.log("  DATABASE_URL=\"postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres\"");
    process.exit(1);
  }

  console.log("🔍 Supabase接続テストを開始します...\n");
  console.log(`接続URL: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}\n`);

  let sql: postgres.Sql<Record<string, unknown>> | null = null;

  try {
    // データベース接続
    sql = postgres(DATABASE_URL, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
    });

    console.log("📡 データベースに接続中...");

    // 接続テスト: バージョン確認
    const [version] = await sql`SELECT version()`;
    console.log("✅ 接続成功!");
    console.log(`   データベースバージョン: ${(version as { version: string }).version.split(" ")[0]}\n`);

    // テーブル一覧の確認
    console.log("📋 テーブル一覧を確認中...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (tables.length === 0) {
      console.log("⚠️  テーブルが見つかりませんでした");
      console.log("   database/supabase_schema.sql を実行してスキーマを作成してください\n");
    } else {
      console.log(`✅ ${tables.length}個のテーブルが見つかりました:\n`);
      tables.forEach((table: { table_name: string }) => {
        console.log(`   - ${table.table_name}`);
      });
      console.log();
    }

    // employeesテーブルの存在確認とレコード数
    const employeesTable = tables.find(
      (t: { table_name: string }) => t.table_name === "employees"
    );

    if (employeesTable) {
      console.log("👥 employeesテーブルの情報:");
      const [count] = await sql`SELECT COUNT(*) as count FROM employees`;
      console.log(`   レコード数: ${(count as { count: bigint }).count}\n`);

      // サンプルデータの表示（最大5件）
      const samples = await sql`SELECT employee_number, name, employment_status FROM employees LIMIT 5`;
      if (samples.length > 0) {
        console.log("   サンプルデータ:");
        samples.forEach((emp: { employee_number: string; name: string; employment_status: string }) => {
          console.log(`     - ${emp.employee_number}: ${emp.name} (${emp.employment_status})`);
        });
        console.log();
      }
    } else {
      console.log("⚠️  employeesテーブルが見つかりませんでした");
      console.log("   database/supabase_schema.sql を実行してスキーマを作成してください\n");
    }

    console.log("✅ 接続テスト完了!");
  } catch (error) {
    console.error("\n❌ 接続エラー:");
    if (error instanceof Error) {
      console.error(`   メッセージ: ${error.message}`);
      if (error.message.includes("password authentication failed")) {
        console.error("\n   パスワードが間違っている可能性があります");
        console.error("   DATABASE_URLのパスワードを確認してください");
      } else if (error.message.includes("getaddrinfo ENOTFOUND")) {
        console.error("\n   ホスト名が解決できません");
        console.error("   DATABASE_URLのホスト名を確認してください");
      } else if (error.message.includes("timeout")) {
        console.error("\n   接続タイムアウト");
        console.error("   ネットワーク接続とファイアウォール設定を確認してください");
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
    }
  }
}

testConnection().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});

