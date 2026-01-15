/**
 * スキーマ確認スクリプト
 */

import { existsSync } from "node:fs";
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
    break;
  }
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL環境変数が設定されていません");
  process.exit(1);
}

async function checkSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // テーブル一覧を取得
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log("📋 テーブル一覧:");
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // employment_historyのカラムを確認
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'employment_history'
      ORDER BY ordinal_position
    `);
    
    console.log("\n📋 employment_history テーブルのカラム:");
    columnsResult.rows.forEach(row => 
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    // employeesのカラムを確認
    const empColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'employees'
      ORDER BY ordinal_position
    `);
    
    console.log("\n📋 employees テーブルのカラム:");
    empColumnsResult.rows.forEach(row => 
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    // contractsのカラムを確認
    const contractColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'contracts'
      ORDER BY ordinal_position
    `);
    
    console.log("\n📋 contracts テーブルのカラム:");
    contractColumnsResult.rows.forEach(row => 
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    client.release();
  } catch (error) {
    console.error("❌ エラー:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkSchema();

