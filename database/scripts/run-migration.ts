/**
 * マイグレーション実行スクリプト
 * 
 * 使用方法:
 *   pnpm tsx database/scripts/run-migration.ts
 * 
 * または:
 *   cd database && pnpm tsx scripts/run-migration.ts
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

async function runMigration() {
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
    
    // 別のディレクトリから実行された場合のフォールバック
    const altMigrationsDir = path.join(process.cwd(), "database", "migrations");
    const altMigrationsDir2 = path.join(process.cwd(), "migrations");
    
    const migrationFiles = [
      "001_schema_update.sql",
      "002_sample_data.sql",
    ];

    console.log(`📁 マイグレーションディレクトリ: ${migrationsDir}`);

    for (const file of migrationFiles) {
      let filePath = path.join(migrationsDir, file);
      
      if (!existsSync(filePath)) {
        filePath = path.join(altMigrationsDir, file);
      }
      
      if (!existsSync(filePath)) {
        filePath = path.join(altMigrationsDir2, file);
      }
      
      if (!existsSync(filePath)) {
        console.warn(`⚠️ マイグレーションファイルが見つかりません: ${file}`);
        console.warn(`   試行したパス: ${migrationsDir}, ${altMigrationsDir}, ${altMigrationsDir2}`);
        continue;
      }

      console.log(`\n📄 実行中: ${file}`);
      const sql = readFileSync(filePath, "utf-8");
      
      try {
        await client.query(sql);
        console.log(`✅ 完了: ${file}`);
      } catch (err) {
        console.error(`❌ エラー (${file}):`, err);
        throw err;
      }
    }

    client.release();
    console.log("\n🎉 すべてのマイグレーションが完了しました");

  } catch (error) {
    console.error("❌ マイグレーション中にエラーが発生しました:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

