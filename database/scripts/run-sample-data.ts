/**
 * サンプルデータ投入スクリプト
 * 
 * 使用方法:
 *   pnpm tsx database/scripts/run-sample-data.ts
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";

// .envファイルを読み込むためのパス候補
const candidateEnvPaths = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "..", ".env"),
  path.join(process.cwd(), "..", "..", ".env"),
];

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
    console.log(`環境変数を読み込みました: ${envPath}`);
    break;
  }
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL環境変数が設定されていません");
  process.exit(1);
}

async function runSampleData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log("🔄 データベースに接続中...");
    const client = await pool.connect();
    console.log("✅ データベースに接続しました");

    // スクリプトファイルの場所を基準にマイグレーションディレクトリを解決
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    const migrationsDir = path.join(scriptDir, "..", "migrations");
    
    const filePath = path.join(migrationsDir, "002_sample_data.sql");
    
    if (!existsSync(filePath)) {
      console.error(`❌ サンプルデータファイルが見つかりません: ${filePath}`);
      process.exit(1);
    }

    console.log(`\n📄 実行中: 002_sample_data.sql`);
    const sql = readFileSync(filePath, "utf-8");
    
    try {
      await client.query(sql);
      console.log(`✅ 完了: サンプルデータ投入`);
    } catch (err) {
      console.error(`❌ エラー:`, err);
      throw err;
    }

    client.release();
    console.log("\n🎉 サンプルデータの投入が完了しました");

  } catch (error) {
    console.error("❌ サンプルデータ投入中にエラーが発生しました:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSampleData();

